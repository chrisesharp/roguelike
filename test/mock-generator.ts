import { Tile } from '../src/common/tile';
import { MapGenerator } from '../src/server/generators';
import * as tiles from '../src/server/server-tiles';

const contents = [
    '####',
    '#..#',
    '#..#',
    '#...',
    '#*##'
];

function getTile(x: number, y: number): Tile {
    if (contents[y][x] === '*') {
        return tiles.gateTile;
    } else {
        return (contents[y][x] === '#') ? tiles.wallTile : tiles.floorTile;
    }
}

export class MockGenerator implements MapGenerator {
    private readonly width: number;
    private readonly height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    generateLevel(): Tile[][] {
        const map = Array.from({ length: this.height}, (_, y) =>
            Array.from({ length: this.width }, (_, x) => getTile(x, y)));
        return map;
    }
}
