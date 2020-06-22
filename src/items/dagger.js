"use strict";

import Item from '../client/javascripts/item.js';

export default class Dagger extends Item {
    constructor(properties) {
        super(properties);
        this.name = "dagger";
        this.details = "it has a sharp edge"
        this.wiedable = true;
        this.damage = 3;
        this.setGlyph({
            char: '!',
            foreground: 'lightblue'
          });
    }
}