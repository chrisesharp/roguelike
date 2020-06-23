"use strict";

import ServerEntity from './server-entity.js';

export default class Warrior extends ServerEntity {
    constructor(properties) {
        super(properties);
        this.hitPoints = this.maxHitPoints = 10;
        this.setGlyph({'char':"@",'foreground':'yellow','background':"black"});
    }

    toHitBonus() {
        return 1;
    }

}