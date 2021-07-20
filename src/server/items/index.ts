
import { Rock } from './rock';
import { Dagger } from './dagger';
import { Apple } from './apple';
import { Item, ItemProperties } from 'src/common/item';

export interface ItemTypes {
    [key: string]: (properties: ItemProperties) => Item
}

export const Items: ItemTypes = {
    rock: (properties) => new Rock(properties),
    dagger: (properties) => new Dagger(properties),
    apple: (properties) => new Apple(properties),
};
