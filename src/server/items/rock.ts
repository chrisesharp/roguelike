import { Item, ItemProperties } from '../../common/item';

export class Rock extends Item {
    constructor(properties?: ItemProperties) {
        super(Object.assign({}, properties, {
            name: 'rock',
            details: 'igneous',
            wieldable: true,
            damage: 2,
        }));

        this.setGlyph({
            char: '*',
            foreground: 'grey',
        });
    }
}