import { Item, ItemProperties } from '../../common/item';

export class Apple extends Item {
    constructor(properties: ItemProperties = {}) {
        super(Object.assign({}, properties, {
            name: 'apple',
            details: 'it looks edible',
            edible: true,
        }));

        this.setGlyph({
            char: 'o',
            foreground: 'green',
        });
    }
}