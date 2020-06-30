"use strict";

import Tile from "./tile";
const nullTile = new Tile();

export default class Map {
    constructor(template={}) {
        this.width = template.width;
        this.height = template.height;
        this.depth = template.depth;
        this.tiles = template.tiles;
        this.entrance = template.entrance;
        this.fov = template.fov;
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
}