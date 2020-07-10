"use strict";

import ServerEntity from './server-entity.js';
import Item from '../../common/item.js';

const corpse = new Item({'name':'wizard corpse','char':'%','foreground':'red','background':"black"});

export default class Wizard extends ServerEntity {
    constructor(properties) {
        super(properties);
        this.corpse = corpse;
        this.hitPoints = this.maxHitPoints = 4;
        this.details = "an elderly wizard"
        this.setGlyph({'char':"@",'foreground':'blue','background':"black"});
    }

}