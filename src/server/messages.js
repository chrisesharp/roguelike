"use strict";

export const MSGTYPE = {
    INF:  1, 
    UPD:   2,
}

export const Messages = {
    LEFT_DUNGEON: (subject) => {return `${subject} just shuffled off this mortal coil`; },
    ENTER_ROOM: (subject) => { return `${subject} just entered this cave.`; },
    LEAVE_ROOM: (subject) => { return `${subject} just left this cave.`; },
    NO_WALK: () => { return "You cannot walk there."; },
    NO_CLIMB: () => { return "You can't go that way!"; },
    ASCEND: (level) => { return `You ascend to level ${level}!`;},
    DESCEND: (level) => { return `You descend to level ${level}!`;},
    CANT_TAKE: () => { return "You cannot take that item.";},
    MULTIPLE_ITEMS: () => { return "There are several objects here.";},
    SINGLE_ITEM: (item) => { return `You see ${[item.describeA()]}.`;},
    ENTITY_THERE: (other) => { return `${other.name} is there.`;},
    ENTITY_DEAD: (other) => { return `You see a dead ${other.name}.`;},
    HIT_BY: (other, dmg) => { return `You hit ${other.name} for ${dmg} damage.`;},
    HIT_OTHER: (other, dmg) => { return `${other.name} hit you for ${dmg} damage.`},
    YOU_MISSED: (other) => { return `You missed ${other.name}!`;},
    MISSED_YOU: (other) => { return `${other.name} missed you.`},
    TAKE_DMG: () => { return "Ouch!";},
    DIED: () => { return "You died!";},
    TAKE_ITEM: (item) => { return `You take ${item.describeThe()}.`;},
    DROP_ITEM: (item) => { return `You drop ${item.describeThe()}.`;},
    EAT_FOOD: (food) => { return `You eat ${food.describeThe()}.`},
    NO_EAT: (itemName) => { return `You don't have the ${itemName} to eat.`},
    NO_WIELD: () => { return "You are not wielding anything now.";},
    NO_WEAR: () => { return "You are not wearing anything now."; },
    USE_ITEM: (verb, item) => { return `You are ${verb}ing ${item.describeThe()}.`;},
    NO_USE: (verb, item) => { return `You don't have any ${item} to ${verb}.`;},
    TELEPORT: () => { return "Your world spins as you are teleported to somewhere else!"},
}
