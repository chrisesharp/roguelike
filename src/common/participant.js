"use strict";

import Entity from '../common/entity.js';
import Item from '../common/item.js';
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
        socket.emit('map');
        socket.emit('get_items');
        this.socket = socket;
    }

    disconnectFromServer() {
        this.socket.disconnect();
    }

    registerEventHandlers(socket) {
        socket.on('ping', () => {
            this.caller.refresh('ping');
        });
        socket.on('message', (message) => {
            if (this.hasChangedRoom(message)) {
                socket.emit('get_items');
            }
            this.caller.addMessage(message);
            this.caller.refresh('message');
        });

        socket.on('delete', (pos) => {
            let entity = this.getEntityAt(pos.x, pos.y, pos.z);
            if (entity) {
                delete this.others[entity.id];
                this.removeEntity(entity);
                this.caller.refresh('delete');
            }
        });

        socket.on('map', (map) => {
            this.caller.mapAvailable(map);
            this.caller.refresh('map', map);
        });

        socket.on('items',(items) => {
            this.items = {};
            for (let pos in items) {
                let here = items[pos];
                here.forEach(item => {
                    this.addItem(new Item(item)); 
                });
            }
            this.caller.refresh('items');
        });

        socket.on('entities', (entities) => {
            for (let socket_id in entities) {
                let entity = entities[socket_id];
                if (socket_id !== socket.id) {
                    this.updateOthers(socket_id, entity);
                } else {
                    this.updateOurself(entity);
                }
            }
            this.caller.refresh('entities');
        });

        socket.on('update', (entity) => {
            this.participant.assume(entity);
            this.caller.refresh('update');
        });

        socket.on('dead', (entity) => {
            this.participant.assume(entity);
            this.caller.refresh('dead');
        });

        socket.on('position', (payload) => {
            let socket_id = payload[0];
            let pos = payload[1];
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
            this.caller.refresh('position', socket_id);
        });
    }

    sync() {
        this.socket.emit('get_items');
        this.socket.emit('get_entities');
    }

    updateOthers(socket_id, entity) {
        let npc = this.others[socket_id];
        if (npc) {
            npc.assume(entity);
            npc.id = socket_id;
            this.moveEntity(npc, entity.pos);
        } else {
            npc = new Entity(entity);
            npc.id = socket_id;
            this.others[socket_id] = npc;
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
        this.socket.emit("move", direction);
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
        this.socket.emit("take", item.name);
    }

    dropItem(item) {
        this.socket.emit("drop", item.name);
    }

    eat(item) {
        this.socket.emit("eat", item.name);
    }

    wieldItem(item) {
        let weapon = (item) ? item.name : null;
        this.socket.emit("wield", weapon);
    }

    wearItem(item) {
        let armour = (item) ? item.name : null;
        this.socket.emit("wear", armour);
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