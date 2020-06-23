"use strict";

import Cave from "./cave.js";
import { Tiles } from "./tile-server.js";
import { getMovement } from "./client/javascripts/movement.js";
import EntityRepository from "./entity-repository.js";
import { MSGTYPE } from "./messages.js";
import _ from "underscore";

export default class Server {
    constructor(backend, template) {
        this.backend = backend;
        this.cave = new Cave(template);
        this.repo = new EntityRepository();
        this.connections = {};
    } 

    tryMove(entity, delta) {
        let x = entity.pos.x + delta.x;
        let y = entity.pos.y + delta.y;
        let z = entity.pos.z + delta.z;
        let newPos = {x:x, y:y, z:z};
        let tile = this.cave.getMap().getTile(x, y, entity.pos.z);

        if (z < entity.pos.z) {
            if (tile != Tiles.stairsUpTile) {
                this.sendMessage(entity, MSGTYPE.INF, "You can't go up here!");
                return false;
            } else {
                this.sendMessage(entity, MSGTYPE.INF, `You ascend to level ${[z]}!`);
                return true;
            }
        }

        if (z > entity.pos.z) {
            if (tile != Tiles.stairsDownTile) {
                this.sendMessage(entity, MSGTYPE.INF, "You can't go down here!");
                return false;
            } else {
                this.sendMessage(entity, MSGTYPE.INF, `You descend to level ${[z]}!`);
                return true;
            }
        }

        let target = this.getEntityAt(newPos);
        if (target) {
            entity.handleCollision(target);
            return false;
        }
        
        if (tile.isWalkable()) {
            let items = this.cave.getItemsAt(newPos);
            if (items.length > 0) {
                let msg = (items.length === 1) ? `You see ${[items[0].describeA()]}.` : "There are several objects here.";
                this.sendMessage(entity, MSGTYPE.INF, msg);
            }
            return true;
        }
        this.sendMessage(entity, MSGTYPE.INF, "You cannot walk there.");
        return false;
    }

    addEntity(id, prototype, pos) {
        prototype.pos = pos;
        let entity = this.repo.create(prototype);
        entity.entrance = pos;
        this.connections[id] = entity;
        return entity;
    }

    getEntityAt(pos) {
        for (let socket_id in this.connections) {
            let entity = this.connections[socket_id];
            if (_.isEqual(entity.pos,pos)) {
                return entity;
            }
        }
    }

    removeEntity(id) {
        delete this.connections[id];
    }

    sendMessage(entity, ...message) {
        let type = message.shift();
        for (let socket_id in this.connections) {
            if (this.connections[socket_id] === entity) {
                this.backend.to(socket_id).emit("message", message);
                if (type === MSGTYPE.UPD) {
                    let cmd = (entity.isAlive()) ? "update" : "dead";
                    this.backend.to(socket_id).emit(cmd, entity);
                }
            }
        }
    }

    // sendMessageToRoom(room, ...message) {
    //     this.backend.sockets.in(room).emit('message', message); 
    // }

    setMessengerForEntities() {
        let svr = this;
        ( function () {
            let msgFunc = (entity, type, message) => {
                svr.sendMessage(entity, type, message);
            };
            svr.repo.setMessenger(msgFunc);
        })();
    }

    connection(socket) {
        this.setMessengerForEntities();
        let prototype = socket.handshake.query;
        let entity = this.addEntity(socket.id, prototype, this.cave.getEntrance());
        // let room = this.cave.getRegion(entity);
        let room = entity.pos.z;
        socket.join(room, () => {
            // let rooms = Object.keys(socket.rooms);
            socket.to(room).emit(entity.name + " just entered this cave");
            this.backend.emit("message",  entity.name + " just entered this dungeon complex");
            this.backend.emit("entities", this.connections);
        });
        this.registerEventHandlers(socket, entity);
    }

    registerEventHandlers(socket, entity) {
        socket.on("get_entities", () => {
            socket.emit("entities", this.connections);
        });

        socket.on("get_items", () => {
            socket.emit("items", this.cave.getItems(entity.pos.z));
        });

        socket.on("take", (itemName) => {
            let items = this.cave.getItemsAt(entity.pos);
            let item = items.find(o => (o.name === itemName));
            if (item && entity.tryTake(item)) {
                let room = entity.pos.z;
                this.cave.removeItem(item);
                this.backend.sockets.in(room).emit('items', this.cave.getItems(room)); 
            } else {
                this.sendMessage(entity, MSGTYPE.INF, "You cannot take that item.");
            }
        });

        socket.on("drop", (itemName) => {
            let item = entity.dropItem(itemName);
            if (item) {
                let room = entity.pos.z;
                this.cave.addItem(entity.pos, item);
                this.backend.sockets.in(room).emit('items', this.cave.getItems(room)); 
            }
        });

        socket.on("eat", (food) => {
            entity.eat(food);
        });

        socket.on("wield", (weapon) => {
            entity.wield(weapon);
        });

        socket.on("wear", (armour) => {
            entity.wear(armour);
        });

        socket.on("move", direction => {
            let delta = getMovement(direction);
            let canMove = (entity.isAlive()) ? this.tryMove(entity, delta) : false;
            if (canMove) {
                let position = {
                    "x":entity.pos.x + delta.x,
                    "y":entity.pos.y + delta.y,
                    "z":entity.pos.z + delta.z,
                }
                let startRoom = entity.pos.z;
                let newRoom = position.z;
                entity.pos = position;
                if (!(newRoom in socket.rooms)) {
                    socket.leave(startRoom, () => {
                        socket.to(startRoom).emit(entity.name + " just left this cave");
                    });
                    socket.join(newRoom, () => {
                        socket.to(startRoom).emit(entity.name + " just entered this cave");
                    });
                }
                this.backend.emit("position", socket.id, entity.pos);
            }
        });

        socket.on("map", () => {
            let map = this.cave.getMap();
            map.entrance = this.connections[socket.id].entrance;
            socket.emit("map", map);
        });

        socket.on("get_position", () => {
            socket.emit("position", socket.id, this.connections[socket.id].pos);
        });

        socket.on("disconnect", (reason) => {
            this.backend.emit("delete",entity.pos);
            delete this.connections[socket.id];
        });
    }
}