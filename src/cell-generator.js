"use strict";

import { floorTile, wallTile } from  './tile-server.js';
import ROT from "rot-js";

export default class CellGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.generator = new ROT.Map.Cellular(this.width, this.height);
    }
    
    generateLevel() {
        this.generator.randomize(0.5);
        let map = this.emptyMap();
        let totalIterations = 3;
        for (let i = 0; i < totalIterations - 1; i++) {
            this.generator.create();
        }
        this.generator.create(function(x,y,v) {
            map[y][x] = (v) ? floorTile : wallTile;
        });
        return map;
    }

    emptyMap() {
        let map = new Array(this.height);
        for (let y = 0; y < this.height; y++) {
            map[y] = new Array(this.width).fill(0);
        }
        return map;
    }
}