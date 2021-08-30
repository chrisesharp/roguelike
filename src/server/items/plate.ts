import { Item, ItemProperties } from '../../common/item';

export class PlateArmour extends Item {
    constructor(properties: ItemProperties = {}) {
        super(Object.assign({}, properties, {
            name: 'plate armour',
            details: 'made from bright steel',
            wearable: true,
            ac: -5,
        }));

        this.setGlyph({
            char: '[',
            foreground: 'silver'
        });
    }
}