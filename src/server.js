"use strict";

import Cave from "./cave.js";
import { Tiles } from "./tile-server.js";
import { getMovement } from "./client/javascripts/movement.js";
import EntityRepository from "./entity-repository.js";
import { MSGTYPE } from "./messages.js";
import _ from "underscore";
import State from "./state.js";
import e from "express";

export default class Server {
    constructor(backend, template) {
        this.backend = backend;
        this.cave = new Cave(template);
        this.repo = new EntityRepository();
        this.entities = new State(this.repo);
        this.repo.setMessengerForEntities(this);
    }

    connection(socket) {
        let prototype = socket.handshake.query;
        let entity = this.entities.addEntity(socket.id, prototype, this.cave.getEntrance());
        this.registerEventHandlers(socket, entity, this);
        this.backend.emit("entities", this.entities.getEntities());
        this.enterRoom(socket, entity, this.cave.getRegion(entity.pos));
    }

    disconnect(socket) {
        let entity = this.entities.getEntity(socket.id);
        this.backend.emit("delete",entity.pos);
        this.backend.emit("message",  entity.name + " just left this dungeon complex");
        this.entities.removeEntity(socket.id);
    }

    registerEventHandlers(socket, entity, server) {
        socket.on("get_entities", () => {
            socket.emit("entities", server.entities.getEntities());
        });

        socket.on("get_items", () => {
            socket.emit("items", server.cave.getItems(entity.pos.z));
        });

        socket.on("take", (itemName) => {
            server.takeItem(entity, itemName);
        });

        socket.on("drop", (itemName) => {
            server.dropItem(entity, itemName);
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
            server.moveEntity(socket, entity, direction);
        });

        socket.on("map", () => {
            socket.emit("map", server.getMap(entity));
        });

        socket.on("get_position", () => {
            socket.emit("position", socket.id, entity.pos);
        });

        socket.on("disconnect", (reason) => {
            server.disconnect(socket);
        });
    }

    moveRoom(socket, entity, startRoom) {
        this.leaveRoom(socket, entity, startRoom);
        this.enterRoom(socket, entity, this.cave.getRegion(entity.pos));
    }

    enterRoom(socket, entity, room) {
        socket.join(room, () => {
            socket.broadcast.to(room).emit("message", entity.name + " just entered this cave.");
        });
    }

    leaveRoom(socket, entity, room) {
        socket.leave(room, () => {
            this.sendMessageToRoom(room, entity.name + " just left this cave.");
        });
    }

    sendMessage(entity, ...message) {
        let type = message.shift();
        for (let id in this.entities.getEntities()) {
            if (this.entities.getEntity(id) === entity) {
                this.backend.to(id).emit("message", message);
                if (type === MSGTYPE.UPD) {
                    let cmd = (entity.isAlive()) ? "update" : "dead";
                    this.backend.to(id).emit(cmd, entity);
                }
            }
        }
    }

    sendMessageToRoom(room, ...message) {
        this.backend.in(room).emit('message', message); 
    }

    takeItem(entity, itemName) {
        let items = this.cave.getItemsAt(entity.pos);
        let item = items.find(o => (o.name === itemName));
        if (item && entity.tryTake(item)) {
            let room = this.cave.getRegion(entity.pos);
            this.cave.removeItem(item);
            this.backend.sockets.in(room).emit('items', this.cave.getItems(room)); 
        } else {
            entity.messenger(entity, MSGTYPE.INF, "You cannot take that item.");
        }
    }

    dropItem(entity, itemName) {
        let item = entity.dropItem(itemName);
        if (item) {
            let room = this.cave.getRegion(entity.pos);
            this.cave.addItem(entity.pos, item);
            this.backend.sockets.in(room).emit('items', this.cave.getItems(room)); 
        }
    }

    moveEntity(socket, entity, direction) {
        let delta = getMovement(direction);
        let position = (entity.isAlive()) ? this.tryMove(entity, delta) : null;
        if (position) {
            let startRoom = this.cave.getRegion(entity.pos);
            let newRoom = this.cave.getRegion(position);
            entity.pos = position;
            if (!(newRoom in socket.rooms)) {
                this.moveRoom(socket, entity, startRoom);
            }
            this.backend.emit("position", socket.id, entity.pos);
        }
    }

    tryMove(entity, delta) {
        let x = entity.pos.x + delta.x;
        let y = entity.pos.y + delta.y;
        let z = entity.pos.z + delta.z;
        let newPos = {x:x, y:y, z:z};
        let tile = this.cave.getMap().getTile(x, y, entity.pos.z);

        let target = this.entities.getEntityAt(newPos);
        if (target) {
            entity.handleCollision(target);
            return null;
        }
        
        if (tile.isWalkable()) {
            if (z !== entity.pos.z) {
                return this.levelChange(entity, newPos, tile);
            }

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

    getMap(entity) {
        let map = this.cave.getMap();
        map.entrance = entity.entrance;
        return map;
    }
}