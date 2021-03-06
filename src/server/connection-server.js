"use strict";

import EntityServer from "./entity-server.js";
import Messaging from "./messaging.js";
import { Messages } from "./messages.js";
import { EVENTS } from "../common/events.js";

export default class ConnectionServer {
    constructor(http, template) {
        this.template = template;
        this.open = true;
        let callback = ((socket) => {
            this.connection(socket);
        });
        this.messaging = new Messaging(http, callback);
        this.entityServer = new EntityServer(this.messaging, template);
    }

    connection(socket) {
        if (this.open) {
            let prototype = socket.handshake.auth;
            if (!prototype.role) {
                socket.emit(EVENTS.missingRole);
            } else {
                this.enter(this.entityServer, socket, prototype);
            }
        }
    }

    enter(server, socket, prototype) {
        let entity = server.createEntity(socket.id, prototype);
        this.registerEventHandlers(socket, entity, server);
        this.messaging.sendToAll(EVENTS.entities, server.getEntities());
        this.enterRoom(socket, entity, server.getRoom(entity.pos));
    }

    stop() {
        this.messaging.stop();
        this.open = false;
    }

    registerEventHandlers(socket, entity, server) {
        socket.on(EVENTS.getEntities, () => {
            socket.emit(EVENTS.entities, server.getEntities());
        });

        socket.on(EVENTS.getItems, () => {
            socket.emit(EVENTS.items, server.getItemsForRoom(entity.pos));
        });

        socket.on(EVENTS.getMap, () => {
            socket.emit(EVENTS.map, server.getMap(entity));
        });

        socket.on(EVENTS.getPosition, () => {
            socket.emit(EVENTS.position, entity.getPos());
        });

        socket.on(EVENTS.take, (itemName) => {
            server.takeItem(entity, itemName);
        });

        socket.on(EVENTS.drop, (itemName) => {
            server.dropItem(entity, itemName);
        });

        socket.on(EVENTS.eat, (food) => {
            entity.eat(food);
        });

        socket.on(EVENTS.wield, (weapon) => {
            entity.wield(weapon);
        });

        socket.on(EVENTS.wear, (armour) => {
            entity.wear(armour);
        });

        socket.on(EVENTS.move, (direction) => {
            let startRoom = server.getRoom(entity.pos);
            let newPos = server.moveEntity(entity, direction);
            if (newPos && startRoom !== server.getRoom(newPos)) {
                this.moveRooms(socket, entity, startRoom);
            }
        });

        socket.on(EVENTS.dead, () => {
            entity.kill();
        });

        socket.on(EVENTS.disconnect, (reason) => {
            server.deleteEntity(entity);
        });
    }

    moveRooms(socket, entity, startRoom) {
        this.leaveRoom(socket, entity, startRoom);
        this.enterRoom(socket, entity, this.entityServer.getRoom(entity.pos));
    }

    enterRoom(socket, entity, room) {
        socket.join(room);
        socket.broadcast.to(room).emit(EVENTS.message, Messages.ENTER_ROOM(entity.describeA()));
        socket.emit(EVENTS.items, this.entityServer.getItemsForRoom(entity.pos));
    }

    leaveRoom(socket, entity, room) {
        socket.leave(room, () => {
            this.messaging.sendMessageToRoom(room, Messages.LEAVE_ROOM(entity.describeA()));
        });
    }

    reset(properties) {
        this.entityServer.reset(properties);
        // console.log("Server reset");
    }
}