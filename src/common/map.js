"use strict";

import Tile from "./tile.js";
const nullTile = new Tile();

export default class Map {
    constructor(template) {
        this.width = template.width;
        this.height = template.height;
        this.depth = template.depth;
        this.tiles = template.tiles;
        this.entrance = template.entrance;
        this.fov = template.fov;
    }

    getEntrance() {
        return this.entrance;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    getDepth() {
        return this.depth;
    }

    getTile(x, y, z) {
        if (this.withinBounds(x, y, z)) {
            return (this.tiles[z][y][x] instanceof Tile) ? (this.tiles[z][y][x]) : new Tile((this.tiles[z][y][x]));
        }
        return nullTile;
    }

    withinBounds(x, y, z) {
        return !(x < 0 || y < 0 || z < 0 || x >= this.width || y >= this.height || z >= this.depth);
    }
}