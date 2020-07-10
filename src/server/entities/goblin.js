"use strict";

import ServerEntity from './server-entity.js';
import Item from '../../common/item.js';

const corpse = new Item({'name':'goblin corpse','char':'%','foreground':'red','background':"black"});

export default class Goblin extends ServerEntity {
    constructor(properties) {
        super(properties);
        this.hitPoints = this.maxHitPoints = 2;
        this.details = "a creeping goblin";
        this.role = "goblin";
        this.type = "monster";
        this.corpse = corpse;
        this.sight = 20;
        this.setGlyph({'char':"&",'foreground':'green','background':"black"});
    }

    isWielding() {
        return true;
    }

}