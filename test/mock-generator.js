"use strict";

// import Tile from '../src/client/javascripts/tile.js'
import { Tiles } from '../src/tile-server.js';

export default class MockGenerator {
    constructor(width, height) {
      this.width = width;
      this.height = height;
    }
  
    generateLevel() {
        return this.emptyMap();
    }
  
    emptyMap() {
        const contents  = [
          '####',
          '#..#',
          '#..#',
          '#...',
          '####'
        ];
        let map = new Array(this.height);
        for (let y = 0; y < this.height; y++) {
          map[y] = new Array(this.width);
          for (let x = 0; x < this.width; x++) {
            // let tile = new Tile({char:contents[y][x],diggable:true, description:"mock wall"});
            let tile = (contents[y][x]==='#') ? Tiles.wallTile : Tiles.floorTile;
            map[y][x] = tile;
          }
        }
        return map;
    }
  }