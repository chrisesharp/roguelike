"use strict";

import ServerEntity from './server-entity.js';
import Dagger from '../items/dagger.js';

// const dagger = new Dagger();

export default class Goblin extends ServerEntity {
    constructor(properties) {
        super(properties);
        this.hitPoints = this.maxHitPoints = 2;
        this.details = "a creeping goblin"
        this.sight = 20;
        // this.currentWeapon = dagger;
        this.setGlyph({'char':"&",'foreground':'green','background':"black"});
    }

}