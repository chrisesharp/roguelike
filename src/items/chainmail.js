"use strict";

import Item from '../client/javascripts/item.js';

export default class Chainmail extends Item {
    constructor(properties) {
        super(properties);
        this.name = "chainmail";
        this.details = "old and rusty"
        this.wearable = true;
        this.ac = -3;
        this.setGlyph({
            char: '[',
            foreground: 'darkgrey'
          });
    }
}