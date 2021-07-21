import { Glyph, GlyphState } from './glyph';

export interface TileState extends GlyphState {
    walkable: boolean;
    diggable: boolean;
    blocksLight: boolean;
    gateway: boolean;
    description: string;
}

export type TileProperties = Partial<TileState>;

export class Tile extends Glyph {
    private readonly walkable: boolean;
    private readonly diggable: boolean;
    private readonly blocksLight: boolean;
    private readonly gateway: boolean;
    private readonly description: string;

    constructor(properties: TileProperties = {}) {
        super(properties);

        this.walkable = properties.walkable || false;
        this.diggable = properties.diggable || false;
        this.blocksLight = properties.blocksLight ?? true;
        this.gateway = properties.gateway || false;
        this.description = properties.description || '(unknown)';
    }
    
    isWalkable(): boolean {
        return this.walkable;
    }

    isDiggable(): boolean {
        return this.diggable;
    }

    isBlockingLight(): boolean {
        return this.blocksLight;
    }

    isGateway(): boolean {
        return this.gateway;
    }

    getDescription(): string {
        return this.description;
    }

    serialize(): TileState {
        return Object.assign({
            walkable: this.walkable,
            diggable: this.diggable,
            gateway: this.gateway,
            blocksLight: this.blocksLight,
            description: this.description,
        }, super.serialize());
    }
}
