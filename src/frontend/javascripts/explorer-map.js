"use strict";

import Tile from "../../common/tile";
import Map from "../../common/map";
import { FOV } from "./display";
const nullTile = new Tile();

export default class ExplorerMap extends Map {
    constructor(template={}) {
        super(template);
        this.explored = this.setupExploredArray();
    }

    setupExploredArray() {
        let explored = new Array(this.depth);
        for (let z = 0; z < this.depth; z++) {
            explored[z] = new Array(this.height);
            for (let y = 0; y < this.height; y++) {
                explored[z][y] = new Array(this.width).fill(false);
            }
        }
        return explored;
    }

    getFov(depth) {
        return this.fov[depth];
    }

    isExplored(x, y, z) {
        return (this.onMap(x,y,z) && this.explored[z][y][x]);
    }

    setExplored(x, y, z, state) {
        if (this.onMap(x, y, z) && this.getTile(x, y, z) !== nullTile) {
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

    onMap(x, y, z) {
        return !(x<0 || x >= this.width || y < 0 || y >= this.height || z >= this.depth);
    }
}