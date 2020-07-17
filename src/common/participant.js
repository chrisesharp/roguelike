"use strict";

import Entity from '../common/entity.js';
import Item from '../common/item.js';
import { EVENTS } from '../common/events.js';
import io from 'socket.io-client';
import _ from 'underscore';

export default class Participant {
    constructor(serverAddr, caller) {
        this.serverAddr = serverAddr;
        this.caller = caller;
        this.entities = {};
        this.items = {};
        this.participant = new Entity();
        this.addEntity(this.participant);
        this.others = {};
        this.socket = null;
    }

    connectToServer(properties) {
        let socket = io(this.serverAddr, {
            'reconnection delay': 0,
            'reopen delay': 0,
            'force new connection': true,
            transports: ['websocket'],
            query: properties,
        });
        this.registerEventHandlers(socket);
        socket.emit(EVENTS.getMap);
        socket.emit(EVENTS.getItems);
        this.socket = socket;
    }

    disconnectFromServer() {
        this.socket.disconnect();
    }

    registerEventHandlers(socket) {
        socket.on(EVENTS.ping, () => {
            this.caller.refresh(EVENTS.ping);
        });
        socket.on(EVENTS.message, (message) => {
            if (this.hasChangedRoom(message)) {
                socket.emit(EVENTS.getItems);
            }
            this.caller.addMessage(message);
            this.caller.refresh(EVENTS.message);
        });

        socket.on(EVENTS.delete, (pos) => {
            let entity = this.getEntityAt(pos.x, pos.y, pos.z);
            if (entity) {
                delete this.others[entity.id];
                this.removeEntity(entity);
                this.caller.refresh(EVENTS.delete);
            }
        });

        socket.on(EVENTS.map, (map) => {
            this.caller.mapAvailable(map);
            this.caller.refresh(EVENTS.map, map);
        });

        socket.on(EVENTS.items,(items) => {
            this.items = {};
            for (let pos in items) {
                let here = items[pos];
                here.forEach(item => {
                    this.addItem(new Item(item)); 
                });
            }
            this.caller.refresh(EVENTS.items);
        });

        socket.on(EVENTS.entities, (entities) => {
            entities.forEach(entity => {
                if (entity.id !== socket.id) {
                    this.updateOthers(entity);
                } else {
                    this.updateOurself(entity);
                }
            });
            this.caller.refresh(EVENTS.entities);
        });

        socket.on(EVENTS.update, (entity) => {
            this.participant.assume(entity);
            this.caller.refresh(EVENTS.update);
        });

        socket.on(EVENTS.dead, (entity) => {
            this.participant.assume(entity);
            this.caller.refresh(EVENTS.dead);
        });

        socket.on(EVENTS.position, (payload) => {
            let socket_id = payload.id;
            let pos = payload.pos;
            if (socket_id === socket.id) {
                this.moveEntity(this.participant, pos);
            } else {
                let npc = this.others[socket_id];
                if (npc) {
                    this.moveEntity(npc, pos);
                } else {
                    this.sync();
                }
            }
            this.caller.refresh(EVENTS.position, socket_id);
        });
    }

    sync() {
        this.socket.emit(EVENTS.getItems);
        this.socket.emit(EVENTS.getEntities);
    }

    updateOthers(entity) {
        let npc = this.others[entity.id];
        if (npc) {
            npc.assume(entity);
            this.moveEntity(npc, entity.pos);
        } else {
            npc = new Entity(entity);
            this.others[npc.id] = npc;
            this.addEntity(npc);
        }
    }

    updateOurself(entity) {
        this.removeEntity(this.participant);
        this.participant.assume(entity);
        this.addEntity(this.participant);
    }

    hasChangedRoom(message) {
        return (message[0].search('level')>0);
    }

    move(direction) {
        this.socket.emit(EVENTS.move, direction);
    }

    key(x, y, z) {
        return '(' + x + ',' + y + ',' + z + ')';
    }

    posToKey(pos) {
        return this.key(pos.x, pos.y, pos.z);
    }

    addEntity(entity) {
        let key = this.posToKey(entity.pos);
        this.entities[key] = entity;
    }

    getEntityAt(x, y, z) {
        return this.entities[this.key(x, y, z)];
    }

    removeEntity(entity) {
        this.removeEntityAt(entity.pos);
    }

    removeEntityAt(pos) {
        let key = this.posToKey(pos);
        if (this.entities.hasOwnProperty(key)) {
            delete this.entities[key];
        };
    }

    moveEntity(entity, dest) {
        if (_.isEqual(entity.pos, dest)) {
            return;
        }
        this.removeEntity(entity);
        entity.pos = dest;
        this.addEntity(entity);
    }

    getItemsAt(x, y, z) {
        return this.items[this.key(x, y, z)];
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

    addItem(item) {
        let key = this.posToKey(item.pos);
        if (this.items[key]) {
            this.items[key].push(item);
        } else {
            this.items[key] = [item];
        }
    }

    getParticipant() {
        return this.participant;
    }
}