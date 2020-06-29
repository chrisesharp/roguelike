"use strict";

import Item from '../../common/item.js';

export default class Apple extends Item {
    constructor(properties) {
        super(properties);
        this.name = "apple";
        this.details = "it looks edible"
        this.edible = true;
        this.setGlyph({
            char: 'o',
            foreground: 'green'
          });
    }
}