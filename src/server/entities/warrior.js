"use strict";

import ServerEntity from './server-entity.js';
import Item from '../../common/item.js';

export default class Warrior extends ServerEntity {
    constructor(properties) {
        super(properties);
        this.corpse = new Item({'name':'warrior corpse','char':'%','foreground':'red','background':"black"});
        this.hitPoints = this.maxHitPoints = 10;
        this.hitBonus = 1;
        this.details = "a brawny warrior";
        this.setGlyph({'char':"@",'foreground':'yellow','background':"black"});
    }

}