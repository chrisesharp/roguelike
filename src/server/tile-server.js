"use strict";

import Tile from '../client/tile.js';

export const nullTile = new Tile();

export const floorTile = new Tile({
    char: '.',
    walkable: true,
    blocksLight: false,
    description: 'A cave floor'
});

export const wallTile = new Tile({
    char: '#',
    foreground: 'goldenrod',
    diggable: true,
    description: 'A cave wall'
});

export const stairsUpTile = new Tile({
    char: '<',
    foreground: 'white',
    walkable: true,
    blocksLight: false,
    description: 'A rock staircase leading upwards'
});

export const stairsDownTile = new Tile({
    char: '>',
    foreground: 'white',
    walkable: true,
    blocksLight: false,
    description: 'A rock staircase leading downwards'
});

export const holeToCavernTile = new Tile({
    char: 'O',
    foreground: 'white',
    walkable: true,
    blocksLight: false,
    description: 'A great dark hole in the ground'
});

export const waterTile = new Tile({
    char: '~',
    foreground: 'blue',
    walkable: false,
    blocksLight: false,
    description: 'Murky blue water'
});

import * as Tiles from "./tile-server.js";
export { Tiles };