"use strict";

export const DIRS = {
    NORTH:  1, 
    EAST:   2, 
    SOUTH:  3,
    WEST:   4,
    UP:     5,
    DOWN:   6,
    properties: {
        1: { name: "north", x: 0, y:-1, z: 0, opposite: 3, left: 4, right: 2 },
        2: { name: "east", x: 1, y: 0, z: 0, opposite: 4, left: 1, right: 3 },
        3: { name: "south", x: 0, y: 1, z: 0, opposite: 1, left: 2, right: 4 },
        4: { name: "west", x:-1, y: 0, z: 0, opposite: 2, left: 3, right: 1 },
        5: { name: "up", x: 0, y: 0, z:-1, opposite: 6},
        6: { name: "down", x: 0, y: 0, z: 1, opposite: 5 },
        undefined: {x:0, y:0, z:0}
    }
} 

export const getMovement = function(direction) {
    let x = DIRS.properties[direction].x;
    let y = DIRS.properties[direction].y;
    let z = DIRS.properties[direction].z;
    return {x:x, y:y, z:z};
}

export const opposite = function(direction) {
    return DIRS.properties[direction].opposite;
}

export const left = function(direction) {
    return DIRS.properties[direction].left;
}

export const right = function(direction) {
    return DIRS.properties[direction].right;
}