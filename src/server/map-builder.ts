import { Location } from "../common/location";
import { emptyMap, GameMap, MapTemplate } from "../common/map";
import { Tile } from "../common/tile";
import { GeneratorOptions, generators, MapGenerator } from "./generators";
import * as Tiles from "./server-tiles";
import FOV from 'rot-js/lib/fov/fov'

function createGenerator(generatorName: string, width: number, height: number, template: GeneratorOptions): MapGenerator {
    const newGenerator = generators[generatorName];
    if (!newGenerator) {
        throw new Error(`Unknown map generator: ${generatorName}`);
    }
    return newGenerator(width, height, template);
}

export interface Position {
    x: number;
    y: number;
}

export interface MapBuilderTemplate extends MapTemplate, GeneratorOptions {
    regionSize: number;
    randomiser: (positions: Position[]) => Position;
    generator: string;
    fov: FOV[];
}

// function printTiles(tiles: Array<Array<Array<Tile | unknown>>>): void {
//     console.log(tiles.map(z => z.map(x => x.map(t => t instanceof Tile ? t.getChar() : t))));
// }

function shuffle<T>(input: T[]): void {
    for (let i = 0; i < input.length - 1; i++) {
        const j = i + Math.floor(Math.random() * input.length - i);
        [input[j], input[i]] = [input[i], input[j]];
    }
}

function randomIndexes(limit: number): number[] {
    const result = Array.from({ length: limit }, (_, i) => i);
    shuffle(result);
    return result;
}

export class MapBuilder extends GameMap {
    private readonly regionSize: number;
    private readonly randomiser: (positions: Position[]) => Position;
    private regions: number[][][] = [];
    private readonly generator: MapGenerator;
    private readonly gateways: Location[][];
    protected fov: FOV[] = [];

    constructor(template: MapBuilderTemplate) {
        super(Object.assign({}, template, {
            tiles: [], // This will break so needs to be set to a good value before use
        }));
        this.regionSize = template.regionSize;
        this.randomiser = template.randomiser;
        this.generator = createGenerator(template.generator, this.getWidth(), this.getHeight(), template);

        this.gateways = this.newGateways();
    }

    private newTiles(): Tile[][][] {
        return Array.from({ length: this.getDepth() }, (_, i) => this.generator.generateLevel(i));
    }

    private newRegions(): number[][][] {
        const width = this.getWidth();
        const height = this.getHeight();
        return Array.from({ length: this.getDepth() }, () => emptyMap(0, width, height));
    }

    private newGateways(): Location[][] {
        return Array.from({ length: this.getDepth() }, () => []);
    }

    getGateways(): Location[][] {
        return this.gateways;
    }
    
    generate(): this {
        this.tiles = this.newTiles();
        this.regions = this.newRegions();
        for (let z = 0; z < this.getDepth(); z++) {
            this.setupRegions(z);
        }
        this.connectAllRegionsVertically();
        return this;
    }

    addTile(x: number, y: number, z: number, tile: Tile): void {
        this.tiles[z][y][x] = tile;
    }

    addGateway(x: number, y: number, z: number): void {
        this.tiles[z][y][x] = Tiles.gateTile;
    }

    setupRegions(z: number): void {
        let region = 1;
        for (let x = 0; x < this.getWidth(); x++) {
            for (let y = 0; y < this.getHeight(); y++) {
                if (this.canFillRegion(x, y, z)) {
                    if (this.fillRegion(region, x, y, z) <= this.regionSize) {
                        this.removeRegion(region, z);
                    } else {
                        region++;
                    }
                }
                if (this.isGateway(x, y, z)) {
                    this.gateways[z] = this.gateways[z] || [];
                    this.gateways[z].push({ x, y, z });
                }
            }
        }
    }

    canFillRegion(x: number, y: number, z: number): boolean {
        if (!this.withinBounds(x, y, z)) {
            return false;
        }
        const region = this.regions[z][y][x];
        const tile = this.tiles[z][y][x];
        return !region && tile instanceof Tile && tile.isWalkable();
    }

    fillRegion(region: number, x: number, y: number, z: number): number {
        let tilesFilled = 1;
        const positions = [{ x, y }];

        this.regions[z][y][x] = region;

        for (let position: Position | undefined; (position = positions.pop()) !== undefined; ) {
            const neighbours = this.getNeighbourPositions(position);

            while ((position = neighbours.pop()) !== undefined) {
                if (this.canFillRegion(position.x, position.y, z)) {
                    this.regions[z][position.y][position.x] = region;
                    positions.push(position);
                    tilesFilled++;
                }
            }
        }
        return tilesFilled;
    }

    removeRegion(region: number, z: number): void {
        for (let x = 0; x < this.getWidth(); x++) {
            for (let y = 0; y < this.getHeight(); y++) {
                if (this.regions[z][y][x] === region) {
                    this.regions[z][y][x] = 0;
                    this.tiles[z][y][x] = Tiles.wallTile;
                }
            }
        }
    }

    getNeighbourPositions(tile: Position): Position[] {
        const x = tile.x;
        const y = tile.y;
        const positions: Position[] = [];
        for (let dX = -1; dX < 2; dX ++) {
            for (let dY = -1; dY < 2; dY++) {
                if (dX === 0 && dY === 0) {
                    continue;
                }
                positions.push({x: x + dX, y: y + dY});
            }
        }
        return positions;
    }

    connectAllRegionsVertically(): void {
        for (let z = 0; z < this.getDepth() - 1; z++) {
            const connected: { [k: string]: boolean } = {};
            for (let x = 0; x < this.getWidth(); x++) {
                for (let y = 0; y < this.getHeight(); y++) {
                    const key = this.regions[z][y][x] + ',' + this.regions[z+1][y][x];
                    if (!connected[key] && this.potentialConnection(x,y,z)) {
                        const isConnected = this.connectRegions(z, this.regions[z][y][x],
                            this.regions[z+1][y][x]);
                        connected[key] = (connected[key] || isConnected);
                    }
                }
            }
        }
    }

    potentialConnection(x: number, y: number, z: number): boolean {
        const tile1 = this.tiles[z][y][x];
        const tile2 = this.tiles[z+1][y][x];
        return (tile1 === Tiles.floorTile && tile2 === Tiles.floorTile);
    }

    connectRegions(z: number, r1: number, r2: number): boolean {
        const overlap = this.findRegionOverlaps(z, r1, r2);
        if (overlap.length) {
            const point = this.randomiser(overlap);
            this.tiles[z][point.y][point.x] = Tiles.stairsDownTile;
            this.tiles[z+1][point.y][point.x] = Tiles.stairsUpTile;
            return true;
        }
        return false;
    }

    findRegionOverlaps(z: number, r1: number, r2: number): Position[] {
        const matches: Position[] = [];

        for (let x = 0; x < this.getWidth(); x++) {
            for (let y = 0; y < this.getHeight(); y++) {
                if (this.tiles[z][y][x] === Tiles.floorTile &&
                    this.tiles[z+1][y][x] === Tiles.floorTile &&
                    this.regions[z][y][x] === r1 &&
                    this.regions[z+1][y][x] === r2) {
                    matches.push({x: x, y: y});
                }
            }
        }
        return matches;
    }

    getRandomFloorPosition(z: number): Location {
        const xs = randomIndexes(this.getWidth());
        const ys = randomIndexes(this.getHeight());

        for (const x of xs) {
            for (const y of ys) {
                if (this.isEmptyFloor(x, y, z)) {
                    return { x, y, z };
                }
            }
        }

        throw new Error('No empty floor tiles');
    }

    isEmptyFloor(x: number, y: number, z: number): boolean {
        return this.getTile(x, y, z) === Tiles.floorTile;
    }

    isGateway(x: number, y: number, z: number): boolean {
        return this.getTile(x, y, z) === Tiles.gateTile;
    }
}
