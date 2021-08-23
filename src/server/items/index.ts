import { Item, ItemProperties } from '../../common/item';
import { Rock } from './rock';
import { Dagger } from './dagger';
import { Apple } from './apple';
import { Chainmail } from './chainmail';
import { LeatherArmour } from './leather';
import { PlateArmour } from './plate';
import { Mushroom } from './mushroom';
import { Sword } from './sword';

export interface ItemTypes {
    [key: string]: (properties: ItemProperties) => Item
}

export const Items: ItemTypes = {
    rock: (properties) => new Rock(properties),
    dagger: (properties) => new Dagger(properties),
    sword: (properties) => new Sword(properties),
    apple: (properties) => new Apple(properties),
    mushroom: (properties) => new Mushroom(properties),
    chainmail: (properties) => new Chainmail(properties),
    leather: (properties) => new LeatherArmour(properties),
    plate: (properties) => new PlateArmour(properties),
 };
