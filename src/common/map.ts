import { Location } from './item';
import { Tile, TileProperties } from './tile';

const nullTile = new Tile();

export interface MapTemplate {
    width: number;
    height: number;
    depth: number;
    tiles?: Array<Array<Array<Tile | TileProperties>>>;
}

function nullTiles(width: number, height: number, depth: number): Tile[][][] {
    return Array.from({ length: depth }, () => emptyMap(nullTile, width, height));
}

export function emptyMap<T>(cell: T, width: number, height: number): T[][] {
    return Array.from({ length: height }, () => new Array(width).fill(cell));
}

export class GameMap {
    entrance?: Location;
    private readonly width: number;
    private readonly height: number;
    private readonly depth: number;
    protected tiles: Array<Array<Array<Tile | TileProperties>>>;

    constructor(template: MapTemplate) {
        this.width = template.width;
        this.height = template.height;
        this.depth = template.depth;
        this.tiles = template.tiles || nullTiles(template.width, template.height, template.depth);
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
            const tile = this.tiles[z][y][x];
            return tile instanceof Tile ? tile : new Tile(tile);
        }
        return nullTile;
    }

    withinBounds(x: number, y: number, z: number): boolean {
        return x >= 0 && y >= 0 && z >= 0 && x < this.width && y < this.height && z < this.depth;
    }
}