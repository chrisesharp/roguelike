"use strict";

import Glyph from './glyph.js';

export default class Tile extends Glyph {
    constructor(properties = {}) {
        super(properties);
        this.walkable = properties['walkable'] || false;
        this.diggable = properties['diggable'] || false;
        this.blocksLight = (properties['blocksLight'] !== undefined) ?
            properties['blocksLight'] : true;
        this.gateway = properties['gateway'] || false;
        this.description = properties['description'] || '(unknown)';
    }
    
    isWalkable() {
        return this.walkable;
    }

    isDiggable() {
        return this.diggable;
    }

    isBlockingLight() {
        return this.blocksLight;
    }

    isGateway() {
        return this.gateway;
    }

    getDescription() {
        return this.description;
    }
};