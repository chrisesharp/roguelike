import { ServerEntity, ServerEntityProperties } from './server-entity';
import { Item } from '../../common/item';

export class Warrior extends ServerEntity {
    constructor(properties: ServerEntityProperties) {
        super(Object.assign({}, properties, {
            corpse: new Item({
                name: 'warrior corpse',
                char:'%',
                foreground: 'red',
                background: 'black',
            }),
            hp: 10,
            hitBonus: 1,
            details: 'a brawny warrior',
        }));

        this.setGlyph({
            char: '@',
            foreground: 'yellow',
            background: 'black'
        });
    }

}