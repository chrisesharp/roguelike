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
        if (!entity.isAlive()) {
            return false;
        }
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
                // socket.join(z, () => {
                //     this.sendMessageToRoom(z, entity.name + " just entered this cave");
                // });
                return true;
            }
        }

        if (z > entity.pos.z) {
            if (tile != Tiles.stairsDownTile) {
                this.sendMessage(entity, MSGTYPE.INF, "You can't go down here!");
                return false;
            } else {
                this.sendMessage(entity, MSGTYPE.INF, `You descend to level ${[z]}!`);
                // socket.join(z, () => {
                //     this.sendMessageToRoom(z, entity.name + " just entered this cave");
                // });
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
                if (items.length === 1) {
                    this.sendMessage(entity, MSGTYPE.INF, `You see ${[items[0].describeA()]}.`);
                } else {
                    this.sendMessage(entity, MSGTYPE.INF, "There are several objects here.");
                }
            }
            return true;
        }
        this.sendMessage(entity, MSGTYPE.INF, "You cannot walk there.");
        return false;
    }

    addEntity(id, prototype, pos) {
        let entity = this.repo.create(prototype);
        entity.pos = pos;
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
                    if (entity.isAlive()) {
                        this.backend.to(socket_id).emit("update", entity);
                    } else {
                        this.backend.to(socket_id).emit("dead", entity);
                    }
                }
            }
        }
    }

    sendMessageToRoom(room, ...message) {
        this.backend.sockets.in(room).emit('message', message); 
    }

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
            this.sendMessageToRoom(room, entity.name + " just entered this cave");
            this.backend.emit("message",  entity.name + " just entered this dungeon complex");
            this.backend.emit("entities", this.connections);
        });

        socket.on("get_entities", () => {
            socket.emit("entities", this.connections);
        });

        socket.on("get_items", () => {
            let entity = this.connections[socket.id];
            // let room = this.cave.getRegion(entity);
            // socket.emit("items", this.cave.getItems(room));
            socket.emit("items", this.cave.getItems(entity.pos.z));
        });

        socket.on("take", (itemName) => {
            let entity = this.connections[socket.id];
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

        socket.on("move", direction => {
            let entity = this.connections[socket.id];
            // let startRoom = this.cave.getRegion(entity);
            let delta = getMovement(direction);
            let canMove = this.tryMove(entity, delta);
            if (canMove) {
                let position = {
                    "x":entity.pos.x + delta.x,
                    "y":entity.pos.y + delta.y,
                    "z":entity.pos.z + delta.z,
                }
                entity.pos = position;
                // let newRoom = this.cave.getRegion(entity);
                // if (!(newRoom in socket.rooms)) {
                    // socket.leave(startRoom, () => {
                    //     this.sendMessageToRoom(room, entity.name + " just entered this cave");
                    // });
                //     socket.join(newRoom, () => {
                //         this.sendMessageToRoom(newRoom, entity.name + " just entered this cave");
                //     });
                // }
                this.backend.emit("position", socket.id, entity.pos);
            }
        });

        socket.on("echo", data => {
            socket.emit("echo", "Hi there, " + data);
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
            this.backend.emit("delete",this.connections[socket.id].pos);
            delete this.connections[socket.id];
        });
    }
}