"use strict";

import ServerEntity from './server-entity.js';
import Item from '../../common/item.js';

export default class Orc extends ServerEntity {
    static level = 2;
    constructor(properties) {
        super(properties);
        this.level = this.level || Orc.level;
        this.hitPoints = this.maxHitPoints = 3;
        this.hitBonus = 1;
        this.details = "a vicious orc";
        this.role = "orc";
        this.type = "monster";
        this.corpse = new Item({'name':'orc corpse','char':'%','foreground':'red','background':"black"});
        this.sight = 20;
        this.setGlyph({'char':"&",'foreground':'red','background':"black"});
    }

    isWielding() {
        return true;
    }

}