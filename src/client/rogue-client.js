"use strict";

import State from './rogue-client-state.js';
import { EVENTS } from '../common/events.js';
import io from 'socket.io-client';

export default class RogueClient {
    constructor(serverAddr, callback) {
        this.serverAddr = serverAddr;
        this.callback = callback;
        this.state = new State();
        this.socket = null;
    }

    connectToServer(properties, callback) {
        this.socket = io(this.serverAddr, {
            'reconnection delay': 0,
            'reopen delay': 0,
            'force new connection': true,
            transports: ['websocket'],
            query: properties,
        });
        if (callback) {
            this.socket.once("connect", () => {
                callback();
            });
        }
        this.registerEventHandlers(this.socket, this.callback);
        this.socket.emit(EVENTS.getMap);
    }

    disconnectFromServer() {
        this.socket.disconnect();
    }

    registerEventHandlers(socket, callback) {
        socket.on(EVENTS.ping, () => {
            callback(EVENTS.ping);
        });

        socket.on(EVENTS.message, (message) => {
            callback(EVENTS.message, message);
        });

        socket.on(EVENTS.delete, (pos) => {
            this.state.removeEntityAt(pos);
            callback(EVENTS.delete, pos);
        });

        socket.on(EVENTS.map, (map) => {
            callback(EVENTS.map, map);
        });

        socket.on(EVENTS.items,(items) => {
            this.state.updateItems(items);
            callback(EVENTS.items, items);
        });

        socket.on(EVENTS.entities, (entities) => {
            this.state.updateEntities(socket.id, entities);
            callback(EVENTS.entities, entities);
        });

        socket.on(EVENTS.update, (entity) => {
            this.state.updateOurself(entity);
            callback(EVENTS.update);
        });

        socket.on(EVENTS.dead, (entity) => {
            this.state.updateOurself(entity);
            callback(EVENTS.dead);
        });

        socket.on(EVENTS.position, (event) => {
            if (!this.state.updateEntityPosition(socket.id, event)) {
                this.sync();
            }
            callback(EVENTS.position, event);
        });

        socket.on(EVENTS.reset, () => {
            this.sync();
            callback(EVENTS.reset);
        });
    }

    sync() {
        this.socket.emit(EVENTS.getMap);
        this.socket.emit(EVENTS.getItems);
        this.socket.emit(EVENTS.getEntities);
    }

    getEntityAt(x, y, z) {
        return this.state.getEntityAt(x, y, z);
    }

    getItemsAt(x, y, z) {
        return this.state.getItemsAt(x, y, z);
    }

    move(direction) {
        this.socket.emit(EVENTS.move, direction);
    }

    takeItem(item) {
        this.socket.emit(EVENTS.take, item.name);
    }

    dropItem(item) {
        this.socket.emit(EVENTS.drop, item.name);
    }

    eat(item) {
        this.socket.emit(EVENTS.eat, item.name);
    }

    wieldItem(item) {
        let weapon = (item) ? item.name : null;
        this.socket.emit(EVENTS.wield, weapon);
    }

    wearItem(item) {
        let armour = (item) ? item.name : null;
        this.socket.emit(EVENTS.wear, armour);
    }

    getEntity() {
        return this.state.entity ;
    }

    getOtherEntities() {
        return this.state.getOthers();
    }
}