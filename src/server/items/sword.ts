"use strict";

import { Item, ItemProperties } from '../../common/item';

export class Sword extends Item {
    constructor(properties: ItemProperties = {}) {
        super(Object.assign({}, properties, {
            name: 'sword',
            details: 'it has a vorpal blade',
            wieldable: true,
            damage: 5,
        }));

        this.setGlyph({
            char: '!',
            foreground: 'silver'
        });
    }
}