"use strict";

import { Item, ItemProperties } from '../../common/item';

export class Dagger extends Item {
    constructor(properties: ItemProperties = {}) {
        super(Object.assign({}, properties, {
            name: 'dagger',
            details: 'it has a sharp edge',
            wieldable: true,
            damage: 3,
        }));

        this.setGlyph({
            char: '!',
            foreground: 'lightblue'
        });
    }
}