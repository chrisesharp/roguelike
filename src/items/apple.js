"use strict";

import Item from './item.js';

export default class Apple extends Item {
    constructor(properties) {
        super(properties);
        this.name = "apple";
        this.setGlyph({
            char: 'o',
            foreground: 'green'
          });
    }
}