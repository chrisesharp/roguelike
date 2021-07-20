import { Item, Location } from 'src/common/item';
import _ from 'underscore';
import { ItemFactory, ItemTypeFrequency } from './item-factory';
import { MapBuilder, MapBuilderTemplate, Position } from './map-builder';

export const DEFAULT_SIZE = Object.freeze({
    width: 50,
    height: 100,
    depth: 2,
});

const DEFAULT_TEMPLATE: MapBuilderTemplate = Object.assign({
    generator: 'FileGenerator',
    randomiser: (arr: Position[]) => arr[0],
    regionSize: 10,
}, DEFAULT_SIZE);

export interface CaveTemplate {
    width?: number;
    height?: number;
    depth?: number;
    itemTypes?: ItemTypeFrequency;
    entrance?: Location;
    generator?: string,
    randomiser?: (positions: Position[]) => Position
}

function newMapBuilder(caveTemplate: CaveTemplate): MapBuilder {
    const mapTemplate: MapBuilderTemplate = Object.assign({}, DEFAULT_TEMPLATE, caveTemplate);
    return new MapBuilder(mapTemplate);
}

interface Gateway {
    pos: Location;
    url: string;
}

export interface CaveItems {
    [pos: string]: Item[];
}

export class Cave {
    private readonly gateways: { [k: string]: Gateway } = {};
    readonly map: MapBuilder;
    private entrance!: Location;
    items: CaveItems = {};
    private readonly itemRepos: ItemFactory[];

    constructor(template: CaveTemplate = DEFAULT_TEMPLATE) {
        this.map = newMapBuilder(template).generate();
        this.setEntrance(template.entrance);
        this.itemRepos = this.createRepos(template);
        this.distributeItems();
    }

    createRepos(template: CaveTemplate): ItemFactory[] {
        const depth = this.map.getDepth();
        const repos = Array(depth);
        for (let z = 0; z < depth; z++) {
            const levelIdx = `itemTypes${z}`;
            const types: ItemTypeFrequency = (template as any)[levelIdx] || template.itemTypes || {}; // eslint-disable-line @typescript-eslint/no-explicit-any
            repos[z] = new ItemFactory(types);
        }
        return repos;
    }

    private distributeItems(): void {
        for (let z=0; z < this.map.getDepth(); z++) {
            while (this.itemRepos[z].moreItems()) {
                const pos = this.map.getRandomFloorPosition(z)
                const item = this.itemRepos[z].createRandom()
                this.addItem(pos, item);
            }
        }
    }

    setEntrance(pos?: Location): void {
        this.entrance = pos || this.map.getRandomFloorPosition(0);
        this.map.addGateway(this.entrance.x, this.entrance.y, this.entrance.z);
    }

    getEntrance(): Location {
        return this.entrance;
    } 

    getGatewayPositions(): Location[][] {
        return this.map.getGateways();
    }

    addGateway(properties: Gateway): void {
        const pos = properties.pos;
        const url = properties.url;
        if (pos && url) {
            this.gateways[this.key(pos)] = properties;
        }
    }

    getGateway(pos: Location): Gateway {
        return this.gateways[this.key(pos)];
    }

    private key(pos: Location): string {
        return '(' + pos.x + ',' + pos.y + ',' + pos.z + ')';
    }

    getMap(): MapBuilder {
        return this.map;
    }

    getItems(level: number): CaveItems {
        return Object.keys(this.items)
            .filter(key => key.split(',')[2] === `${level})`)
            .reduce<CaveItems>((item, key) => {
                item[key] = this.items[key];
                return item;
            }, {});
    }

    addItem(pos: Location, item: Item): void {
        const key = this.key(pos);
        item.setPos(pos);
        if (this.items[key] !== undefined) {
            this.items[key].push(item);
        } else {
            this.items[key] = [item];
        }
    }

    removeItem(item: Item): void {
        const key = this.key(item.getPos());
        const entries = this.items[key];
        if (entries !== undefined) {
            if (entries.length > 1) {
                for(let i = 0; i < entries.length; i++) {
                    if ( _.isEqual(entries[i], item)) {
                        entries.splice(i, 1);
                    }
                }
            } else {
                delete this.items[key];
            }
        }
    }

    getItemsAt(x: number, y: number, z: number): Item[] {
        const key = this.key({ x, y, z });
        return this.items[key] || [];
    }

    getRegion(pos: Location): number {
        // let x = pos.x;
        // let y = pos.y;
        // let z = pos.z;
        // return this.map.regions[z][y][x];
        return pos.z;
    }
}
