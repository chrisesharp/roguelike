"use strict";

import Entity from '../common/entity';
import Item from '../common/item';
import io from 'socket.io-client';

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
        socket.on('message', (message) => {
            if (this.hasChangedRoom(message)) {
                socket.emit('get_items');
            }
            this.caller.addMessage(message);
            this.caller.refresh('message');
        });

        socket.on('delete', (pos) => {
            this.removeEntityAt(pos);
            this.caller.refresh('delete');
        });

        socket.on('map', (map) => {
            this.caller.mapAvailable(map);
            this.caller.refresh('map');
        });

        socket.on('items',(items) => {
            this.items = {};
            for (let pos in items) {
                let here = items[pos];
                here.forEach(item => {
                    let thing = new Item(item);
                    this.addItem(thing); 
                });
            }
            this.caller.refresh('items');
        });

        socket.on('entities', (entities) => {
            for (let socket_id in entities) {
                if (socket_id !== socket.id) {
                    let npc = this.others[socket_id];
                    if (npc) {
                        npc.assume(entities[socket.id]);
                        this.moveEntity(npc, entities[socket_id].pos);
                    } else {
                        npc = new Entity(entities[socket_id]);
                        this.others[socket_id] = npc;
                        this.addEntity(npc);
                    }
                } else {
                    this.removeEntity(this.participant);
                    this.participant.assume(entities[socket.id]);
                    this.addEntity(this.participant);
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
                    socket.emit('get_items');
                    socket.emit('get_entities');
                }
            }
            this.caller.refresh('position');
        });
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