import { Item, ItemProperties } from 'src/common/item';
import { Items } from './items/index';

export interface ItemFactoryProperties extends ItemProperties {
    type: string;
}

export interface ItemTypeFrequency {
    [itemTypeName: string]: number;
}

export class ItemFactory {
    private readonly typesToCreate: string[];

    constructor(types: ItemTypeFrequency) {
        this.typesToCreate = Object.entries(types)
            .filter(([typeName]) => Items[typeName])
            .map(([typeName, count]) => new Array<string>(count).fill(typeName))
            .flat();
    }

    moreItems(): boolean {
        return this.typesToCreate.length > 0;
    }

    create(prototype: ItemFactoryProperties): Item {
        const newItem = Items[prototype.type];
        if (!newItem) {
            throw new Error(`Unknown item type: ${prototype.type}`);
        }
        return newItem(prototype);
    }

    createRandom(): Item {
        const index = Math.floor(Math.random() * this.typesToCreate.length);
        const type = this.typesToCreate[index];
        this.typesToCreate.splice(index, 1);
        return this.create({ type });
    }

}