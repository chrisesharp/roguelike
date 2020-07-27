"use strict";

import ServerEntity from './server-entity.js';
import Item from '../../common/item.js';

export default class Goblin extends ServerEntity {
    static level = 1;
    constructor(properties) {
        super(properties);
        this.level = this.level || Goblin.level;
        this.hitPoints = this.maxHitPoints = 2;
        this.details = "a creeping goblin";
        this.role = "goblin";
        this.type = "monster";
        this.corpse = new Item({'name':'goblin corpse','char':'%','foreground':'red','background':"black"});
        this.sight = 20;
        this.setGlyph({'char':"&",'foreground':'green','background':"black"});
    }

    isWielding() {
        return true;
    }

}