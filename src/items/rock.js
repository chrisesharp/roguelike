"use strict";

import Item from '../client/javascripts/item.js';

export default class Rock extends Item {
    constructor(properties) {
        super(properties);
        this.name = "rock";
        this.details = "igneous"
        this.setGlyph({
            char: '*',
            foreground: 'grey'
          });
    }
}