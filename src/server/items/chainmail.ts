import { Item, ItemProperties } from '../../common/item';

export class Chainmail extends Item {
    constructor(properties: ItemProperties = {}) {
        super(Object.assign({}, properties, {
            name: 'chainmail',
            details: 'old and rusty',
            wearable: true,
            ac: -3,
        }));

        this.setGlyph({
            char: '[',
            foreground: 'darkgrey'
        });
    }
}