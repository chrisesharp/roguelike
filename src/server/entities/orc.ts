"use strict";

import { Item } from '../../common/item';
import { ServerEntity, ServerEntityProperties } from './server-entity';

export class Orc extends ServerEntity {
    constructor(properties: ServerEntityProperties) {
        super(Object.assign({
            level: 2, // Overridable defaults
        }, properties, {
            // Fixed values, overriding supplied properties
            hitBonus: 1,
            hp: 3,
            details: 'a vicious orc',
            role: 'orc',
            type: 'monster',
            corpse: new Item({
                name: 'orc corpse',
                char: '%',
                foreground: 'red',
                background: 'black',
            }),
            sight: 20,
        }));

        this.setGlyph({
            char: '&',
            foreground: 'red',
            background: 'black',
        });
    }

    isWielding(): boolean {
        return true;
    }

}