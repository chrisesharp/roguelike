/* istanbul ignore file */
/* can't test ROT under Jest */

import * as ROT from 'rot-js';
import { Tile } from '../../common/tile';
import { floorTile, nullTile, wallTile } from '../server-tiles';
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
            map[y][x] = v !== 0 ? floorTile : wallTile;
        });
        return map;
    }
}