import { ServerEntity, ServerEntityProperties } from './server-entity';
import { Item } from '../../common/item';

export class Goblin extends ServerEntity {
    constructor(properties: ServerEntityProperties) {
        super(Object.assign({
            level: 1,
        }, properties, {
            hp: 2,
            maxHP: 2,
            details: 'a creeping goblin',
            role: 'goblin',
            type: 'monster',
            corpse: new Item({
                name: 'goblin corpse',
                char: '%',
                foreground: 'red',
                background: 'black',
            }),
            sight: 20,
        }));

        this.setGlyph({
            char: '&',
            foreground: 'green',
            background: 'black',
        });
    }

    isWielding(): boolean {
        return true;
    }
}
