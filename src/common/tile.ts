import { Glyph, GlyphState } from './glyph';

export interface TileProperties extends Partial<GlyphState> {
    walkable?: boolean;
    diggable?: boolean;
    blocksLight?: boolean;
    gateway?: boolean;
    description?: string;
}

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
}
