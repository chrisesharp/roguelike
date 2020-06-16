"use strict";

import ServerEntity from './server-entity.js';

export default class Wizard extends ServerEntity {
    constructor(properties) {
        super(properties);
        this.hitPoints = this.maxHitPoints = 4;
        this.setGlyph({'char':"@",'foreground':'blue','background':"black"});
    }

}