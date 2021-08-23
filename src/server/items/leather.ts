import { Item, ItemProperties } from '../../common/item';

export class LeatherArmour extends Item {
    constructor(properties: ItemProperties = {}) {
        super(Object.assign({}, properties, {
            name: 'leather armpour',
            details: 'thick padded leather',
            wearable: true,
            ac: -1,
        }));

        this.setGlyph({
            char: '[',
            foreground: 'brown'
        });
    }
}