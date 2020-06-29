"use strict";

import Item from '../../common/item.js';

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