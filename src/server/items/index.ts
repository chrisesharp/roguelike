import { Item, ItemProperties } from '../../common/item';
import { Rock } from './rock';
import { Dagger } from './dagger';
import { Apple } from './apple';
import { Chainmail } from './chainmail';
import { LeatherArmour } from './leather';
import { PlateArmour } from './plate';

export interface ItemTypes {
    [key: string]: (properties: ItemProperties) => Item
}

export const Items: ItemTypes = {
    rock: (properties) => new Rock(properties),
    dagger: (properties) => new Dagger(properties),
    apple: (properties) => new Apple(properties),
    chainmail: (properties) => new Chainmail(properties),
    leather: (properties) => new LeatherArmour(properties),
    plate: (properties) => new PlateArmour(properties),
 };
