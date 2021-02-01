"use strict";

import Map from "../common/map.js"
import { Tiles } from "./server-tiles.js";
import { Generators } from "./generators/index.js";

function dynamicGenerator(generator) {
    return Generators[generator]
}

export default class MapBuilder extends Map {
    constructor(template) {
        super(template);
        this.regionSize = template.regionSize;
        this.randomiser = template.randomiser;
        this.tiles = new Array(this.depth);
        this.regions = new Array(this.depth);
        this.gateways = {};
        this.generator = MapBuilder.createGenerator(template.generator, this.width, this.height, template);
        this.fov = [];
    }

    static createGenerator(generator, width, height, template) {
        let genClass = dynamicGenerator(generator);
        return new genClass(width, height, template);
    }

    getGateways() {
        return this.gateways;
    }
    
    generate() {
        for (let z = 0; z < this.depth; z++) {
            this.tiles[z] = this.generator.generateLevel(z);
            this.regions[z] = this.generator.emptyMap();
        }
        for (let z = 0; z < this.depth; z++) {
            this.setupRegions(z);
        }
        this.connectAllRegionsVertically();
        return this;
    }

    addTile(x, y, z, tile) {
        this.tiles[z][y][x] = tile;
    }

    addGateway(x, y, z) {
        this.tiles[z][y][x] = Tiles.gateTile;
    }

    setupRegions(z) {
        let region = 1;
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.canFillRegion(x, y, z)) {
                    if (this.fillRegion(region, x, y, z) <= this.regionSize) {
                        this.removeRegion(region, z);
                    } else {
                        region++;
                    }
                }
                if (this.isGateway(x, y, z)) {
                    this.gateways[z] = this.gateways[z] || [];
                    this.gateways[z].push({x:x, y:y, z:z});
                }
            }
        }
    }

    canFillRegion(x, y, z) {
        return (this.withinBounds(x, y, z) && 
                (!this.regions[z][y][x]) && 
                this.tiles[z][y][x].isWalkable());
    }

    fillRegion(region, x, y, z) {
        let tilesFilled = 1;
        let tiles = [{x:x, y:y}];

        this.regions[z][y][x] = region;

        while (tiles.length > 0) {
            let tile = tiles.pop();
            let neighbours = this.getNeighbourPositions(tile);

            while (neighbours.length > 0) {
                tile = neighbours.pop();
                if (this.canFillRegion(tile.x, tile.y, z)) {
                    this.regions[z][tile.y][tile.x] = region;
                    tiles.push(tile);
                    tilesFilled++;
                }
            }
        }
        return tilesFilled;
    }

    removeRegion(region, z) {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.regions[z][y][x] == region) {
                    this.regions[z][y][x] = 0;
                    this.tiles[z][y][x] = Tiles.wallTile;
                }
            }
        }
    }

    getNeighbourPositions (tile) {
        let x = tile.x;
        let y = tile.y;
        let tiles = [];
        for (let dX = -1; dX < 2; dX ++) {
            for (let dY = -1; dY < 2; dY++) {
                if (dX == 0 && dY == 0) {
                    continue;
                }
                tiles.push({x: x + dX, y: y + dY});
            }
        }
        return tiles;
    }

    connectAllRegionsVertically() {
        for (let z = 0; z < this.depth - 1; z++) {
            let connected = {};
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    let key = this.regions[z][y][x] + ',' + this.regions[z+1][y][x];
                    if (!connected[key] && this.potentialConnection(x,y,z)) {
                        let isConnected =  this.connectRegions(z, this.regions[z][y][x],
                            this.regions[z+1][y][x]);
                        connected[key] = (connected[key] || isConnected);
                    }
                }
            }
        }
    }

    potentialConnection(x, y, z) {
        let tile1 = this.tiles[z][y][x];
        let tile2 = this.tiles[z+1][y][x]
        return (tile1 == Tiles.floorTile && tile2 == Tiles.floorTile);
    }

    connectRegions(z, r1, r2) {
        let overlap = this.findRegionOverlaps(z, r1, r2);
        if (overlap.length) {
            let point = this.randomiser(overlap);
            this.tiles[z][point.y][point.x] = Tiles.stairsDownTile;
            this.tiles[z+1][point.y][point.x] = Tiles.stairsUpTile;
            return true;
        }
    }

    findRegionOverlaps(z, r1, r2) {
        let matches = [];

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.tiles[z][y][x]  == Tiles.floorTile &&
                    this.tiles[z+1][y][x] == Tiles.floorTile &&
                    this.regions[z][y][x] == r1 &&
                    this.regions[z+1][y][x] == r2) {
                    matches.push({x: x, y: y});
                }
            }
        }
        return matches;
    }

    getRandomFloorPosition(z) {
        let x, y;
        do {
            x = Math.floor(Math.random() * this.width);
            y = Math.floor(Math.random() * this.height);
        } while(!this.isEmptyFloor(x, y, z));
        return {x: x, y: y, z: z};
    }

    isEmptyFloor(x, y, z) {
        return this.getTile(x, y, z) === Tiles.floorTile;
    }

    isGateway(x, y, z) {
        return this.getTile(x, y, z) === Tiles.gateTile;
    }
}

