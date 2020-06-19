"use strict";

import Builder from "./builder.js";
import FileGenerator from "./file-generator.js";
import _ from "underscore";
import Rock from "./items/rock.js";
import Dagger from "./items/dagger.js";
import ItemRepository from "./item-repository.js";

export const DEFAULT_SIZE = {
    "width":50,
    "height":100,
    "depth":2,
    "generator":"FileGenerator", 
    "itemsPerFloor":0,
    "itemTypes": {},
    "randFunc":(arr)=>{return arr[0];}
};

export default class Cave {
    constructor(template=DEFAULT_SIZE) {
        this.map = Cave.builder(template).generate();
        this.entrance = template.entrance;
        this.itemsPerFloor = template.itemsPerFloor;
        this.items = {};
        this.itemRepo = new ItemRepository(template.itemTypes);
        this.distributeItems(this.map);
    }

    static builder(template) {
        let width = template.width || DEFAULT_SIZE.width;
        let height = template.height || DEFAULT_SIZE.height;
        let depth = template.depth || DEFAULT_SIZE.depth;
        let generator = template.generator || DEFAULT_SIZE.generator;
        let randomiser = template.randFunc || DEFAULT_SIZE.randFunc;
        return new Builder(generator, width, height, depth, randomiser);
    }

    distributeItems(map) {
        if (this.itemsPerFloor) {
            for (let z=0; z < map.depth; z++) {
                for (let i = 0; i < this.itemsPerFloor; i++) {
                    let pos = map.getRandomFloorPosition(z)
                    let item = this.itemRepo.createRandom()
                    this.addItem(pos, item);
                }
            }
        }
    }

    getEntrance() {
        return (this.entrance) ? this.entrance : this.map.getEntrance();
    }

    key(pos) {
        return'(' + pos.x + ',' + pos.y + ',' + pos.z + ')';
    }

    getMap() {
        return this.map;
    }

    getItems(level) {
        return Object.keys(this.items)
            .filter(key => key.split(',')[2] === `${level})`)
            .reduce((item, key) => {
                item[key] = this.items[key];
                return item;
            }, {});
    }

    addItem(pos, item) {
        let key = this.key(pos);
        item.pos = pos;
        if (this.items[key] !== undefined) {
            this.items[key].push(item);
        } else {
            this.items[key] = [item];
        }
    }

    removeItem(item) {
        let key = this.key(item.pos);
        let entries = this.items[key];
        if (entries !== undefined) {
            if (entries.length > 1) {
                for(let i = 0; i < entries.length; i++) {
                    if ( _.isEqual(entries[i], item)) {
                        entries.splice(i, 1);
                    }
                }
            } else {
                delete this.items[key];
            }
        }
    }

    getItemsAt(x, y, z) {
        let key = this.key(x, y, z);
        return this.items[key] || [];
    }

    getRegion(entity) {
        let x = entity.pos.x;
        let y = entity.pos.y;
        let z = entity.pos.z;
        return this.map.regions[z][y][x];
    }
}