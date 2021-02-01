"use strict";

import MapBuilder from "./map-builder.js";
import _ from "underscore";
import ItemFactory from "./item-factory.js";

export const DEFAULT_SIZE = {
    "width":50,
    "height":100,
    "depth":2,
    "generator":"FileGenerator", 
    "itemTypes": {},
    "randFunc":(arr)=>{return arr[0];},
    "regionSize": 10,
};

export default class Cave {
    constructor(template=DEFAULT_SIZE) {
        this.gateways = {};
        this.map = Cave.builder(template).generate();
        this.entrance = template.entrance || this.map.getRandomFloorPosition(0);
        this.items = {};
        this.itemRepos = this.createRepos(template);
        this.distributeItems(this.map);
    }

    static builder(template) {
        template.width = template.width || DEFAULT_SIZE.width;
        template.height = template.height || DEFAULT_SIZE.height;
        template.depth = template.depth || DEFAULT_SIZE.depth;
        template.generator = template.generator || DEFAULT_SIZE.generator;
        template.randomiser = template.randFunc || DEFAULT_SIZE.randFunc;
        template.regionSize = template.regionSize || DEFAULT_SIZE.regionSize;
        return new MapBuilder(template);
    }

    createRepos(template) {
        let depth = this.map.getDepth();
        let repos = Array(depth);
        for (let z = 0; z < depth; z++) {
            let levelIdx = `itemTypes${z}`;
            let types =  template[levelIdx] || template.itemTypes || {};
            repos[z] = new ItemFactory(types);
        }
        return repos;
    }

    distributeItems(map) {
        for (let z=0; z < map.getDepth(); z++) {
            while (this.itemRepos[z].moreItems()) {
                let pos = map.getRandomFloorPosition(z)
                let item = this.itemRepos[z].createRandom()
                this.addItem(pos, item);
            }
        }
    }

    getEntrance() {
        return this.entrance
    } 

    getGatewayPositions() {
        return this.map.getGateways();
    }

    addGateway(properties) {
        let pos = properties.pos;
        let url = properties.url;
        if (pos && url) {
            this.gateways[this.key(pos)] = properties;
        }
    }

    getGateway(pos) {
        return this.gateways[this.key(pos)];
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

    getRegion(pos) {
        let x = pos.x;
        let y = pos.y;
        let z = pos.z;
        // return this.map.regions[z][y][x];
        return `${z}`;
    }
}