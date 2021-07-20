import { Entity } from "src/common/entity";
import { Item } from "src/common/item";

export enum MSGTYPE {
    INF = 1, 
    UPD = 2,
}

export const Messages = {
    LEFT_DUNGEON: (subject: string): string => `${subject} just shuffled off this mortal coil`,
    ENTER_ROOM: (subject: string): string => `${subject} just entered this cave.`,
    LEAVE_ROOM: (subject: string): string => `${subject} just left this cave.`,
    NO_WALK: (): string => 'You cannot walk there.',
    NO_CLIMB: (): string => 'You can\'t go that way!',
    ASCEND: (level: number): string => `You ascend to level ${level}!`,
    DESCEND: (level: number): string => `You descend to level ${level}!`,
    CANT_TAKE: (): string => 'You cannot take that item.',
    MULTIPLE_ITEMS: (): string => 'There are several objects here.',
    SINGLE_ITEM: (item: Item): string => `You see ${[item.describeA()]}.`,
    ENTITY_THERE: (other: Entity): string => `${other.getName()} is there.`,
    ENTITY_DEAD: (other: Entity): string => `You see a dead ${other.getName()}.`,
    HIT_BY: (other: Entity, dmg: number): string => `You hit ${other.getName()} for ${dmg} damage.`,
    HIT_OTHER: (other: Entity, dmg: number): string => `${other.getName()} hit you for ${dmg} damage.`,
    YOU_MISSED: (other: Entity): string => `You missed ${other.getName()}!`,
    MISSED_YOU: (other: Entity): string => `${other.getName()} missed you.`,
    TAKE_DMG: (): string => 'Ouch!',
    DIED: (): string => 'You died!',
    TAKE_ITEM: (item: Item): string => `You take ${item.describeThe()}.`,
    DROP_ITEM: (item: Item): string => `You drop ${item.describeThe()}.`,
    EAT_FOOD: (food: Item): string => `You eat ${food.describeThe()}.`,
    NO_EAT: (itemName: string): string => `You don't have the ${itemName} to eat.`,
    NO_WIELD: (): string => 'You are not wielding anything now.',
    NO_WEAR: (): string => 'You are not wearing anything now.',
    USE_ITEM: (verb: string, item: Item): string => `You are ${verb}ing ${item.describeThe()}.`,
    NO_USE: (verb: string, itemName: string): string => `You don't have any ${itemName} to ${verb}.`,
    TELEPORT: (): string => 'Your world spins as you are teleported to somewhere else!',
}
