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

        let target = this.getEntityAt(newPos);
        if (target) {
            entity.handleCollision(target);
            return null;
        }

        if (z !== entity.pos.z) {
            return this.levelChange(entity, newPos, tile);
        }
        
        if (tile.isWalkable()) {
            let items = this.cave.getItemsAt(newPos);
            if (items.length > 0) {
                entity.handleCollision(items);
            }
            return newPos;
        }
        this.sendMessage(entity, MSGTYPE.INF, "You cannot walk there.");
        return null;
    }

    levelChange(entity, newPos, tile) {
        if (newPos.z < entity.pos.z && tile === Tiles.stairsUpTile) {
            this.sendMessage(entity, MSGTYPE.INF, `You ascend to level ${[newPos.z]}!`);
            return newPos;
        }

        if (newPos.z > entity.pos.z && tile === Tiles.stairsDownTile) {
            this.sendMessage(entity, MSGTYPE.INF, `You descend to level ${[newPos.z]}!`);
            return newPos;
        } 
        
        this.sendMessage(entity, MSGTYPE.INF, "You can't go that way!");
        return null;
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
        this.registerEventHandlers(socket, entity, this);
    }

    disconnect(socket) {
        let entity = this.connections[socket.id];
        this.backend.emit("delete",entity.pos);
        this.backend.emit("message",  entity.name + " just left this dungeon complex");
        this.removeEntity(socket.id);
    }

    registerEventHandlers(socket, entity, server) {
        socket.on("get_entities", () => {
            socket.emit("entities", server.connections);
        });

        socket.on("get_items", () => {
            socket.emit("items", server.cave.getItems(entity.pos.z));
        });

        socket.on("take", (itemName) => {
            let items = server.cave.getItemsAt(entity.pos);
            let item = items.find(o => (o.name === itemName));
            if (item && entity.tryTake(item)) {
                let room = entity.pos.z;
                server.cave.removeItem(item);
                server.backend.sockets.in(room).emit('items', server.cave.getItems(room)); 
            } else {
                entity.messenger(entity, MSGTYPE.INF, "You cannot take that item.");
            }
        });

        socket.on("drop", (itemName) => {
            let item = entity.dropItem(itemName);
            if (item) {
                let room = entity.pos.z;
                server.cave.addItem(entity.pos, item);
                server.backend.sockets.in(room).emit('items', server.cave.getItems(room)); 
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
            let position = (entity.isAlive()) ? server.tryMove(entity, delta) : null;
            if (position) {
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
                server.backend.emit("position", socket.id, entity.pos);
            }
        });

        socket.on("map", () => {
            let map = server.cave.getMap();
            map.entrance = entity.entrance;
            socket.emit("map", map);
        });

        socket.on("get_position", () => {
            socket.emit("position", socket.id, entity.pos);
        });

        socket.on("disconnect", (reason) => {
            server.disconnect(socket);
        });
    }
}