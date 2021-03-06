"use strict";

import { Tiles } from '../src/server/server-tiles.js';

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
          '#*##'
        ];
        let map = new Array(this.height);
        for (let y = 0; y < this.height; y++) {
          map[y] = new Array(this.width);
          for (let x = 0; x < this.width; x++) {
            let tile;
            if (contents[y][x]==='*') {
              tile = Tiles.gateTile;
            } else {
              tile = (contents[y][x]==='#') ? Tiles.wallTile : Tiles.floorTile;
            }
            map[y][x] = tile;
          }
        }
        return map;
    }
  }