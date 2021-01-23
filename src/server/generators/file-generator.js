"use strict";
import fs from "fs";
import { floorTile, wallTile } from  '../server-tiles.js';

const mapsDir = process.env.maps || process.env.npm_package_config_maps;

export default class FileGenerator {
    constructor(width, height, template) {
        this.width = width;
        this.height = height;
        this.mapsDir = template.maps || mapsDir;
    }
    
    generateLevel(level) {
        return this.fileMap(`${this.mapsDir}/level-${level}.txt`);
    }

    emptyMap() {
        let map = new Array(this.height);
        for (let y = 0; y < this.height; y++) {
            map[y] = new Array(this.width).fill(0);
        }
        return map;
    }

    fileMap(filepath) {
        let file = fs.readFileSync(filepath, 'utf8');
        let contents = file.split('\n');
        let map = new Array(this.height);
        for (let y = 0; y < this.height; y++) {
            map[y] = new Array(this.width);
            for (let x = 0; x < this.width; x++) {
                let tile = contents[y%contents.length][x%contents[0].length];
                map[y][x] = (tile===".") ? floorTile : wallTile;
            }
        }
        return map;
    }
}