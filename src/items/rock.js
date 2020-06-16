"use strict";

import Item from './item.js';

export default class Rock extends Item {
    constructor(properties) {
        super(properties);
        this.name = "rock";
        this.setGlyph({
            char: '*',
            foreground: 'grey'
          });
    }
}