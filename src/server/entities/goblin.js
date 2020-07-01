"use strict";

import ServerEntity from './server-entity.js';

export default class Goblin extends ServerEntity {
    constructor(properties) {
        super(properties);
        this.hitPoints = this.maxHitPoints = 2;
        this.details = "a creeping goblin"
        this.setGlyph({'char':"&",'foreground':'green','background':"black"});
    }

}