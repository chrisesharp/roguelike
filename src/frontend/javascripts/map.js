"use strict";

import Tile from "../../client/tile";
import { FOV } from "./display";
const nullTile = new Tile();

export default class Map {
    constructor(template={}) {
        this.width = template.width;
        this.height = template.height;
        this.depth = template.depth;
        this.tiles = template.tiles;
        this.fov = template.fov;
        this.entrance = template.entrance;
        this.explored = new Array(this.depth);
        this.setupExploredArray();
    }

    setupExploredArray() {
        for (let z = 0; z < this.depth; z++) {
            this.explored[z] = new Array(this.height);
            for (let y = 0; y < this.height; y++) {
                this.explored[z][y] = new Array(this.width).fill(false);
            }
        }
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    getTile(x, y, z) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return nullTile;
        } else {
            return new Tile(this.tiles[z][y][x]) || nullTile;
        }
    }

    getFov(depth) {
        return this.fov[depth];
    }

    isExplored(x, y, z) {
        return this.explored[z][y][x];
    }

    setExplored(x, y, z, state) {
        if (this.getTile(x, y, z) !== nullTile) {
            this.explored[z][y][x] = state;
        }
    }

    setupFov() {
        let map = this;
        for (let z = 0; z < this.depth; z++) {
            (function() {
                let depth = z;
                map.fov.push(
                    new FOV.PreciseShadowcasting(function(x, y) {
                        return !map.getTile(x, y, depth).isBlockingLight();
                    })
                );
            })();
        }
    }
}