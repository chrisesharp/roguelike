import * as fs from 'fs';
import * as process from 'process';
import { Tile } from '../../common/tile';
import { floorTile, gateTile, nullTile, wallTile } from '../server-tiles';
import { emptyMap } from '../../common/map';
import { GeneratorOptions, MapGenerator } from '.';

const tileMap = {
    [gateTile.getChar()]: gateTile,
    [floorTile.getChar()]: floorTile,
    [wallTile.getChar()]: wallTile,
};

const mapsDir = process.env.maps || process.env.npm_package_config_maps || process.cwd();

export class FileGenerator implements MapGenerator {
    private readonly width: number;
    private readonly height: number;
    private readonly mapsDir: string;

    constructor(width: number, height: number, template: GeneratorOptions) {
        this.width = width;
        this.height = height;
        this.mapsDir = template.maps || mapsDir;
    }
    
    generateLevel(level: number): Tile[][] {
        return this.fileMap(`${this.mapsDir}/level-${level}.txt`);
    }

    private fileMap(filepath: string): Tile[][] {
        const file = fs.readFileSync(filepath, 'utf8');
        const contents = file.split('\n');
        const map = emptyMap(nullTile, this.width, this.height);

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = contents[y%contents.length][x%contents[0].length];
                map[y][x] = tileMap[tile] || wallTile;
            }
        }

        return map;
    }
}