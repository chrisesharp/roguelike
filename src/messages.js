"use strict";

export const MSGTYPE = {
    INF:  1, 
    UPD:   2,
}

export const Messages = {
    LEFT_DUNGEON: (subject) => {return `${subject} just left this dungeon complex`; },
    ENTER_ROOM: (subject) => { return `${subject} just entered this cave.`; },
    LEAVE_ROOM: (subject) => { return `${subject} just left this cave.`; },
    NO_WALK: () => { return "You cannot walk there."; },
    NO_CLIMB: () => { return "You can't go that way!"; },
    ASCEND: (level) => { return `You ascend to level ${level}!`;},
    DESCEND: (level) => { return `You descend to level ${level}!`;},
    CANT_TAKE: () => { return "You cannot take that item.";},
}
