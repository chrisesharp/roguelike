"use strict";

import { State } from './state';
import { EVENTS } from '../common/events';
import { io } from 'socket.io-client';

export default class EntityClient {
    constructor(serverAddr, callback) {
        this.serverAddr = serverAddr;
        this.refreshCallback = callback;
        this.state = new State();
        this.socket = null;
        this.properties = null;
    }

    connectToServer(properties, callback) {
        this.properties = properties;
        let url = properties.url || this.serverAddr;
        // console.log("Connecting to cave at ",url);
        this.socket = io(url, {
            reconnectionDelay: 0,
            transports: ['websocket'],
            auth: properties,
        });
        if (callback) {
            this.socket.once("connect", () => {
                callback();
            });
        }
        this.registerEventHandlers(this.socket, this.refreshCallback);
        this.socket.emit(EVENTS.getMap);
    }

    disconnectFromServer(event) {
        if (event) {
            this.socket.emit(event)
        }
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

        socket.on(EVENTS.reconnect, (properties) => {
            this.reconnect(properties);
            callback(EVENTS.reconnect);
        });
        
        socket.on(EVENTS.reset, (properties) => {
            this.reconnect(properties);
            callback(EVENTS.reset);
        });
    }

    sync() {
        this.socket.emit(EVENTS.getMap);
        this.socket.emit(EVENTS.getItems);
        this.socket.emit(EVENTS.getEntities);
    }

    reconnect(properties) {
        if (properties && properties.url) {
            this.properties.url = properties.url;
        }
        this.state = new State();
        this.disconnectFromServer();
        this.connectToServer(this.properties);
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
        this.socket.emit(EVENTS.take, item.getName());
    }

    dropItem(item) {
        this.socket.emit(EVENTS.drop, item.getName());
    }

    eat(item) {
        this.socket.emit(EVENTS.eat, item.getName());
    }

    wieldItem(item) {
        let weapon = (item) ? item.getName() : null;
        this.socket.emit(EVENTS.wield, weapon);
    }

    wearItem(item) {
        let armour = (item) ? item.getName() : null;
        this.socket.emit(EVENTS.wear, armour);
    }

    getEntity() {
        return this.state.entity ;
    }

    getOtherEntities() {
        return this.state.getOthers();
    }
}