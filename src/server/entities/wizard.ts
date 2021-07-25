import { ServerEntity, ServerEntityProperties } from './server-entity';
import { Item } from '../../common/item';

export class Wizard extends ServerEntity {
    constructor(properties: ServerEntityProperties) {
        super(Object.assign({}, properties, {
            corpse: new Item({
                name: 'wizard corpse',
                char: '%',
                foreground: 'red',
                background: 'black',
            }),
            hp: 4,
            maxHP: 4,
            details: 'an elderly wizard',
        }));

        this.setGlyph({
            char: '@',
            foreground: 'blue',
            background: 'black',
        });
    }
}
