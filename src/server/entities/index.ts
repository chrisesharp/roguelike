import { Warrior } from './warrior';
import { Wizard } from './wizard';
import { Goblin } from './goblin';
import { Orc } from './orc';
import { ServerEntity, ServerEntityProperties } from './server-entity';

export interface EntityTypes {
    [key: string]: (properties: ServerEntityProperties) => ServerEntity
}

export const Players: EntityTypes = {
    warrior: (properties) => new Warrior(properties),
    wizard: (properties)=> new Wizard(properties),
};

export const Monsters: EntityTypes = {
    goblin: (properties) => new Goblin(properties),
    orc: (properties) => new Orc(properties),
};
