// import path from 'path';
import { Cave, CaveTemplate, DEFAULT_SIZE } from '../dist/server/cave';
import { generators } from '../dist/server/generators';
import { Dagger } from '../dist/server/items/dagger';
import { Rock } from '../dist/server/items/rock';
import { Position } from '../dist/server/map-builder';
import * as Tiles from '../dist/server/server-tiles';
import { MockGenerator } from './mock-generator';

describe('cave creation', () => {
    let template: CaveTemplate;

    beforeAll(() => {
        generators.MockGenerator = (width, height) => new MockGenerator(width, height);
    });

    afterAll(() => {
        delete generators.MockGenerator;
    });

    beforeEach(() => {
        const t = {
            width: 4,
            height: 5,
            depth: 3,
            generator: 'MockGenerator',
            entrance: { x: 1, y: 1, z: 0 },
            regionSize: 6,
            // maps: path.join(__dirname, 'test-cave'),
        };
        template = t;
    })

    it('should generate tiles according to default sizes', () => {
        const cave = new Cave();
        const map = cave.getMap();
        expect(map.getWidth()).toBe(DEFAULT_SIZE.width);
        expect(map.getHeight()).toBe(DEFAULT_SIZE.height);
        expect(map.getDepth()).toBe(DEFAULT_SIZE.depth);
        expect(map.getTile(0, 0, 0).getChar()).toBe('#');
    });

    it('should generate tiles according to template sizes', () => {
        const cave = new Cave({ depth: 3 });
        const map = cave.getMap();
        expect(map.getWidth()).toBe(DEFAULT_SIZE.width);
        expect(map.getHeight()).toBe(DEFAULT_SIZE.height);
        expect(map.getDepth()).toBe(3);
        expect(map.getTile(0, 0, 0).getChar()).toBe('#');
    });

    it('should return null tiles outside of map', () => {
        const cave = new Cave(template);
        const map = cave.getMap();
        let tile = map.getTile(-1, 0, 0);
        expect(tile.getChar()).toBe(' ');
        expect(tile.getDescription()).toBe('(unknown)');
        tile = map.getTile(map.getWidth() + 1, 0, 0);
        expect(tile.getChar()).toBe(' ');
        expect(tile.getDescription()).toBe('(unknown)');
        tile = map.getTile(0, -1, 0);
        expect(tile.getChar()).toBe(' ');
        expect(tile.getDescription()).toBe('(unknown)');
        tile = map.getTile(0, map.getHeight() + 1, 0);
        expect(tile.getChar()).toBe(' ');
        expect(tile.getDescription()).toBe('(unknown)');
        tile = map.getTile(0, 0, -1);
        expect(tile.getChar()).toBe(' ');
        expect(tile.getDescription()).toBe('(unknown)');
    });

    it('should generate tiles from map file', () => {
        const cave = new Cave(template);
        const gateways = cave.getGatewayPositions();
        const gwPos = gateways[0][0];
        cave.addGateway({ pos: gwPos, url: "test_url" });
        const map = cave.getMap();
        expect(map.getWidth()).toBe(template.width);
        expect(map.getHeight()).toBe(template.height);
        expect(map.getDepth()).toBe(template.depth);
        const tile = map.getTile(0, 0, 0);
        expect(tile.getChar()).toBe('#');
        expect(tile.getForeground()).toBe('goldenrod');
        expect(tile.getBackground()).toBe('black');
        expect(tile.getRepresentation()).toBe('%c{goldenrod}%b{black}#%c{white}%b{black}');
        expect(tile.isDiggable()).toBe(true);
        expect(tile.isWalkable()).toBe(false);
        expect(tile.isBlockingLight()).toBe(true);
        expect(tile.getDescription()).toBe('A cave wall');
        expect(cave.getEntrance()).toEqual(template.entrance);
        const gate = map.getTile(1, 4, 0);
        expect(gate.getChar()).toBe('*');
        expect(gate.getForeground()).toBe('black');
        expect(gate.getBackground()).toBe('white');
        expect(gate.isWalkable()).toBe(true);
        expect(gate.isDiggable()).toBe(false);
        expect(gate.isBlockingLight()).toBe(false);
        expect(cave.getGateway(gwPos).url).toBe("test_url");
    });

    it('should connect floors by regions using random function', () => {
        const rand = (arr: Position[]) => arr[0];
        const cave = new Cave({ width: 25, height: 10, depth: 3, randomiser: rand });
        const map = cave.getMap();
        const tileLvl0 = map.getTile(0, 1, 0);
        const tileLvl1 = map.getTile(0, 1, 1);
        expect(tileLvl0).toBe(Tiles.stairsDownTile);
        expect(tileLvl1).toBe(Tiles.stairsUpTile);
    });

    it('should fill regions too small', () => {
        const cave = new Cave();
        const map = cave.getMap();
        const wasSpace = map.getTile(22, 2, 0);
        expect(wasSpace).toBe(Tiles.wallTile);
    });

    it('should have 0 number of items', () => {
        const cave = new Cave(template);
        const items = cave.getItemsForRoom(0);
        expect(Object.keys(items).length).toBe(0);
    });

    it('should have 1 number of items', () => {
        template.itemTypes = { "rock": 1 };
        const cave = new Cave(template);
        const items = cave.getItemsForRoom(0);
        expect(Object.keys(items).length).toBe(1);
    });

    it('should have a dagger and a rock', () => {
        (template as any).itemTypes0 = { 'rock': 1, 'dagger': 1 };
        (template as any).itemTypes1 = { 'rock': 1, 'dagger': 1 };
        const cave = new Cave(template);
        const items = cave.getItemsForRoom(0);
        let hasDagger = false;
        let hasRock = false;
        Object.keys(items).forEach(key => {
            items[key].forEach(item => {
                if (item instanceof Rock) {
                    hasRock = true;
                }
                if (item instanceof Dagger) {
                    hasDagger = true;
                }
            });
        });
        expect(hasRock).toBe(true);
        expect(hasDagger).toBe(true);
    });

    it('should have a one dagger where non-existent types requested', () => {
        template.itemTypes = { 'dagger': 1, 'non-thing': 1 };
        const cave = new Cave(template);
        const items = cave.getItemsForRoom(0);
        let hasDagger = 0;
        Object.keys(items).forEach(key => {
            items[key].forEach(item => {
                if (item instanceof Dagger) {
                    hasDagger++;
                }
            });
        });
        expect(hasDagger).toBe(1);
    });

    it('should have two daggers and no rocks', () => {
        (template as any).itemTypes0 = { 'rock': 0, 'dagger': 2, 'non-thing': 1 };
        const cave = new Cave(template);
        const items = cave.getItemsForRoom(0);
        let hasDagger = 0;
        let hasRock = 0;
        Object.keys(items).forEach(key => {
            items[key].forEach(item => {
                if (item instanceof Rock) {
                    hasRock++;
                }
                if (item instanceof Dagger) {
                    hasDagger++;
                }
            });
        });
        expect(hasRock).toBe(0);
        expect(hasDagger).toBe(2);
    });
});
