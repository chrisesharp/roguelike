"use strict";

import Entity from '../common/entity.js';
import Item from '../common/item.js';
import _ from 'underscore';

export default class State {
    constructor() {
        this.entity = new Entity();
        this.entities = {};
        this.others = {};
        this.items = {};
        this.addEntity(this.entity);
    }

    updateEntityPosition(ourId, event) {
        let entity =  (event.id === ourId) ? this.entity : this.others[event.id];
        if (entity) {
            this.moveEntity(entity, event.pos);
            return true
        }
        return false;
    }

    updateEntities(ourId, entities) {
        entities.forEach(entity => {
            if (entity.id === ourId) {
                this.updateOurself(entity);
            } else {
                this.updateOthers(entity);
            }
        });
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
        this.removeEntity(this.entity);
        this.entity.assume(entity);
        this.addEntity(this.entity);
    }

    updateItems(items) {
        this.items = {};
        for (let pos in items) {
            let here = items[pos];
            here.forEach(item => {
                this.addItem(new Item(item)); 
            });
        }
    }

    addItem(item) {
        let key = this.posToKey(item.pos);
        if (this.items[key]) {
            this.items[key].push(item);
        } else {
            this.items[key] = [item];
        }
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

    getOthers() {
        let others = [];
        Object.keys(this.others).forEach(key => {
            others.push(this.others[key]);
        });
        return others;
    }
}