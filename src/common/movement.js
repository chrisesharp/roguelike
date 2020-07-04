"use strict";

export const DIRS = {
    NORTH:  1, 
    EAST:   2, 
    SOUTH:  3,
    WEST:   4,
    UP:     5,
    DOWN:   6,
    properties: {
        1: { name: "north", x: 0, y:-1, z: 0 },
        2: { name: "east", x: 1, y: 0, z: 0 },
        3: { name: "south", x: 0, y: 1, z: 0 },
        4: { name: "west", x:-1, y: 0, z: 0 },
        5: { name: "up", x: 0, y: 0, z:-1 },
        6: { name: "down", x: 0, y: 0, z: 1 }
    }
} 

export const getMovement = function(direction) {
    let x = DIRS.properties[direction].x;
    let y = DIRS.properties[direction].y;
    let z = DIRS.properties[direction].z;
    return {x:x, y:y, z:z};
}

export const opposite = function(direction) {
    if (direction === DIRS.NORTH) {
        return DIRS.SOUTH;
    } else if (direction === DIRS.EAST) {
        return DIRS.WEST;
    } else if (direction === DIRS.SOUTH) {
        return DIRS.NORTH;
    } else if (direction === DIRS.WEST) {
        return DIRS.EAST;
    }
    return direction;
}