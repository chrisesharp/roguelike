import { Item, ItemProperties } from '../../common/item';

export class Mushroom extends Item {
    constructor(properties: ItemProperties = {}) {
        super(Object.assign({}, properties, {
            name: 'mushroom',
            details: 'it looks edible, maybe',
            edible: true,
        }));

        this.setGlyph({
            char: 'o',
            foreground: 'grey',
        });
    }
}