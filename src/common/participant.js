"use strict";

import Map from '../common/map';
import Entity from '../common/entity';
import Item from '../common/item';
import io from 'socket.io-client';

const httpServerAddr = {address:"0.0.0.0", port:3000};

export default class Participant {
    constructor(caller) {
        this.caller = caller;
        this.entities = {};
        this.items = {};
        this.messages = [];
        this.participant = new Entity();
        this.addEntity(this.participant);
        this.others = {};
    }

    connectToServer(properties) {
        let socket = io(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
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

    registerEventHandlers(socket) {
        socket.on('message', (message) => {
            if (this.hasChangedRoom(message)) {
                socket.emit('get_items');
            }
            this.caller.addMessage(message);
        });

        socket.on('delete', (pos) => {
            this.removeEntityAt(pos);
            this.caller.refresh();
        });

        socket.on('map', (data) => {
          let map = new Map(data);
          this.caller.mapAvailable(map);
        });

        socket.on('items',(items) => {
            this.items = [];
            for (let pos in items) {
                let here = items[pos];
                here.forEach(item => {
                    let thing = new Item(item);
                    this.addItem(thing); 
                });
            }
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
            this.caller.refresh();
        });

        socket.on('update', (entity) => {
            this.participant.assume(entity);
            this.caller.refresh();
        });

        socket.on('dead', (entity) => {
            this.participant.assume(entity);
            this.caller.refresh();
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
            this.caller.refresh();
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