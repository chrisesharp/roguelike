"use strict";

import Item from '../../common/item.js';

export default class Rock extends Item {
    constructor(properties) {
        super(properties);
        this.name = "rock";
        this.details = "igneous"
        this.wiedable = true;
        this.damage = 2;
        this.setGlyph({
            char: '*',
            foreground: 'grey'
          });
    }
}