import { Location } from "./movement";
import { Tile, TileProperties, TileState } from './tile';

const nullTile = new Tile();

export interface MapTemplate {
    width: number;
    height: number;
    depth: number;
    tiles?: Array<Array<Array<Tile | TileProperties>>>;
    entrance?: Location;
}

export interface MapState {
    width: number;
    height: number;
    depth: number;
    tiles: TileProperties[][][];
    entrance: Location;
}

function nullTiles(width: number, height: number, depth: number): Tile[][][] {
    return Array.from({ length: depth }, () => emptyMap(nullTile, width, height));
}

export function emptyMap<T>(cell: T, width: number, height: number): T[][] {
    return Array.from({ length: height }, () => new Array(width).fill(cell));
}

function asTiles(input: Array<Array<Array<Tile | TileProperties>>>): Tile[][][] {
    return input.map(z => z.map(y => y.map(t => t instanceof Tile ? t : new Tile(t))));
}

export class GameMap {
    entrance?: Location;
    private readonly width: number;
    private readonly height: number;
    private readonly depth: number;
    protected tiles: Tile[][][];

    constructor(template: MapTemplate) {
        this.width = template.width;
        this.height = template.height;
        this.depth = template.depth;
        const tiles = template.tiles || nullTiles(template.width, template.height, template.depth);
        this.tiles = asTiles(tiles);
        this.entrance = template.entrance;
    }

    getEntrance(): Location | undefined {
        return this.entrance;
    }

    getWidth(): number {
        return this.width;
    }

    getHeight(): number {
        return this.height;
    }

    getDepth(): number {
        return this.depth;
    }

    getTile(x: number, y: number, z: number): Tile {
        if (this.withinBounds(x, y, z)) {
            return this.tiles[z][y][x];
        }
        return nullTile;
    }

    getTilesState(): TileState[][][] {
        return this.tiles.map(z => z.map(y => y.map(t => t.serialize())));
    }

    withinBounds(x: number, y: number, z: number): boolean {
        return x >= 0 && y >= 0 && z >= 0 && x < this.width && y < this.height && z < this.depth;
    }
}