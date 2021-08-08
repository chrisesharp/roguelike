/* istanbul ignore file */
/* can't test ROT under Jest */

import * as ROT from 'rot-js';
import { Tile } from '../../common/tile';
import { floorTile, nullTile, wallTile, graniteTile } from '../server-tiles';
import { emptyMap } from '../../common/map';
import { MapGenerator } from '.';

export class CellGenerator implements MapGenerator {
    private readonly width: number;
    private readonly height: number;
    private readonly generator;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.generator = new ROT.Map.Cellular(this.width, this.height);
    }
    
    generateLevel(): Tile[][] {
        this.generator.randomize(0.5);
        const map = emptyMap(nullTile, this.width, this.height);
        const totalIterations = 3;
        for (let i = 0; i < totalIterations; i++) {
            this.generator.create();
        }
        this.generator.create(function(x,y,v) {
            map[y][x] = (v !== 0) ? floorTile : wallTile;
        });

        this.sealEdges(map);
        return map;
    }

    sealEdges(map: Tile[][]): void {
        for (let y = 0; y < this.height; y++) {
            map[y][0] =  map[y][this.width - 1] = graniteTile;
        }
        for (let x = 0; x < this.width; x++) {
            map[0][x] = map[this.height - 1][x] = graniteTile;
        }
    }
}