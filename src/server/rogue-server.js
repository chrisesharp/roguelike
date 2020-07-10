"use strict";

import Cave from "./cave.js";
import { Tiles } from "./server-tiles.js";
import { getMovement } from "../common/movement.js";
import EntityFactory from "./entity-factory.js";
import { MSGTYPE, Messages } from "./messages.js";
import State from "./state.js";
import Messaging from "./messaging.js";

export default class RogueServer {
    constructor(backend, template) {
        this.messaging = new Messaging(backend);
        this.cave = new Cave(template);
        this.repo = new EntityFactory();
        this.repo.setMessengerForEntities(this);
        this.entities = new State(this.repo);
    }

    stop() {
        this.messaging.stop();
    }

    connection(socket) {
        let prototype = socket.handshake.query;
        if (!prototype.role) {
            socket.emit("missing_role");
        } else {
            prototype.pos = (prototype.pos) ? JSON.parse(prototype.pos) : this.cave.getEntrance();
            let entity = this.entities.addEntity(socket.id, prototype);
            this.registerEventHandlers(socket, entity, this);
            this.messaging.sendToAll("entities",this.entities.getEntities());
            this.enterRoom(socket, entity, this.cave.getRegion(entity.pos));
        }
    }

    disconnect(socket) {
        let entity = this.entities.getEntity(socket.id);
        let gear = entity.getInventory();
        gear.forEach((item) => {
            this.dropItem(entity, item.name);
        });
        this.dropItem(entity, "corpse");
        this.messaging.sendToAll("delete", entity.pos);
        this.messaging.sendToAll("message", Messages.LEFT_DUNGEON(entity.describeA()));
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
            socket.emit("position", [socket.id, entity.pos]);
        });

        socket.on("disconnect", (reason) => {
            server.disconnect(socket);
        });
    }

    enterRoom(socket, entity, room) {
        socket.join(room, () => {
            socket.broadcast.to(room).emit("message", Messages.ENTER_ROOM(entity.describeA()));
        });
    }

    leaveRoom(socket, entity, room) {
        socket.leave(room, () => {
            this.messaging.sendMessageToRoom(room, Messages.LEAVE_ROOM(entity.describeA()));
        });
    }

    moveRooms(socket, entity, startRoom) {
        this.leaveRoom(socket, entity, startRoom);
        this.enterRoom(socket, entity, this.cave.getRegion(entity.pos));
    }

    sendMessage(entity, ...message) {
        let type = message.shift();
        this.messaging.sendMessageToEntity(entity, "message", message);
        if (type === MSGTYPE.UPD) {
            let cmd = (entity.isAlive()) ? "update" : "dead";
            this.messaging.sendMessageToEntity(entity, cmd, entity);
        }
    }

    takeItem(entity, itemName) {
        let items = this.cave.getItemsAt(entity.pos);
        let item = items.find(o => (o.name === itemName));
        if (item && entity.tryTake(item)) {
            let room = this.cave.getRegion(entity.pos);
            this.cave.removeItem(item);
            this.messaging.sendToRoom(room, "items", this.cave.getItems(room));
        } else {
            entity.messenger(entity, MSGTYPE.INF, Messages.CANT_TAKE(itemName));
        }
    }

    dropItem(entity, itemName) {
        let item = entity.dropItem(itemName);
        if (item) {
            let room = this.cave.getRegion(entity.pos);
            this.cave.addItem(entity.pos, item);
            this.messaging.sendToRoom(room, "items", this.cave.getItems(room));
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
                this.moveRooms(socket, entity, startRoom);
            }
        }
        this.messaging.sendToAll("position", [socket.id, entity.pos])
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
        this.sendMessage(entity, MSGTYPE.INF, Messages.NO_WALK(entity));
        return null;
    }

    levelChange(entity, newPos, tile) {
        if (newPos.z < entity.pos.z && tile === Tiles.stairsUpTile) {
            this.sendMessage(entity, MSGTYPE.INF, Messages.ASCEND([newPos.z]));
            return newPos;
        }

        if (newPos.z > entity.pos.z && tile === Tiles.stairsDownTile) {
            this.sendMessage(entity, MSGTYPE.INF, Messages.DESCEND([newPos.z]));
            return newPos;
        } 
        
        this.sendMessage(entity, MSGTYPE.INF, Messages.NO_CLIMB(entity));
        return null;
    }

    getMap(entity) {
        let map = this.cave.getMap();
        map.entrance = entity.entrance;
        return map;
    }
}