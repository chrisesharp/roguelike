export enum DIRS {
    NORTH = "NORTH",
    EAST = "EAST",
    SOUTH = "SOUTH",
    WEST = "WEST",
    UP = "UP",
    DOWN = "DOWN",
}

export interface Movement {
    x: number;
    y: number;
    z: number;
}

interface Direction extends Movement {
    opposite: DIRS;
    left?: DIRS;
    right?: DIRS;
}

const directions: { [key in DIRS]: Direction } = {
    [DIRS.NORTH]: { x: 0, y:-1, z: 0, opposite: DIRS.SOUTH, left: DIRS.WEST, right: DIRS.EAST },
    [DIRS.EAST]: { x: 1, y: 0, z: 0, opposite: DIRS.WEST, left: DIRS.NORTH, right: DIRS.SOUTH }, 
    [DIRS.SOUTH]: { x: 0, y: 1, z: 0, opposite: DIRS.NORTH, left: DIRS.EAST, right: DIRS.WEST },
    [DIRS.WEST]: { x: -1, y: 0, z: 0, opposite: DIRS.EAST, left: DIRS.SOUTH, right: DIRS.NORTH },
    [DIRS.UP]: { x: 0, y: 0, z: -1, opposite: DIRS.DOWN },
    [DIRS.DOWN]: { x: 0, y: 0, z: 1, opposite: DIRS.UP },
} 

export function getMovement(direction?: DIRS): Movement {
    if (direction && Object.values(DIRS).includes(direction)) {
        return directions[direction];
    }
    return {x:0, y:0, z:0};
}

export function opposite(direction: DIRS): DIRS {
    return directions[direction].opposite;
}

export function left(direction: DIRS): DIRS | undefined {
    return directions[direction].left;
}

export function right(direction: DIRS): DIRS | undefined {
    return directions[direction].right;
}
