"use strict";

import Item from './item.js';

export default class Dagger extends Item {
    constructor(properties) {
        super(properties);
        this.name = "dagger";
        this.setGlyph({
            char: '!',
            foreground: 'lightblue'
          });
    }
}