"use strict";

import Builder from "./builder.js";
import FileGenerator from "./file-generator.js";
import _ from "underscore";

export const DEFAULT_SIZE = {
    "width":50,
    "height":100,
    "depth":2,
    "generator":FileGenerator, 
    "randFunc":(arr)=>{return arr[0];}
};

export default class Cave {
    constructor(template=DEFAULT_SIZE) {
        this.map = Cave.builder(template).generate();
        this.entrance = template.entrance;
        this.items = {};
    }

    static builder(template) {
        let width = template.width || DEFAULT_SIZE.width;
        let height = template.height || DEFAULT_SIZE.height;
        let depth = template.depth || DEFAULT_SIZE.depth;
        let generator = template.generator || DEFAULT_SIZE.generator;
        let randomiser = template.randFunc || DEFAULT_SIZE.randFunc;
        let ctor = template.builder || Builder;
        return new ctor(generator, width, height, depth, randomiser);
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

    getItems() {
        return this.items;
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
}