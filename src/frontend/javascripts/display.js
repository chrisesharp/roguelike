"use strict";

import { Display } from 'rot-js';
import { Glyph } from '../../common/glyph';

export { Path, Map, Util, Scheduler, Engine, FOV, KEYS, RNG, Color}  from 'rot-js';

export class OurDisplay extends Display {
    draw(x, y, glyph, fg=null, bg=null) {
        if (glyph instanceof Glyph) {
            super.draw(x, y, glyph.getChar(), glyph.getForeground(), glyph.getBackground());
        } else {
            super.draw(x, y, glyph, fg, bg);
        }
    }
}

export const dispOpts = {
    layout: "rect",
    fontFamily: "helvetica",
    fontSize: 20,

    fgIntensity: 1.0,
    bgIntensity: 0.4,
    
    tileWidth: 10,
    tileHeight: 10,
    tileColorize: true,
    tileMap: {
        " ": [0, 0],
        "!": [10, 0],
        '"': [20, 0],
        "#": [30, 0],
        "$": [40, 0],
        "%": [50, 0],
        "&": [60, 0],
        "'": [70, 0],
        "(": [80,0],
        ")": [90,0],
        "'": [100,0],
        "+": [110,0],
        ",": [120,0],
        "-": [130,0],
        ".": [140,0],
        "/": [150,0],
        "0": [160, 0],
        "1": [170, 0],
        "2": [180, 0],
        "3": [190, 0],
        "4": [200, 0],
        "5": [210, 0],
        "6": [220, 0],
        "7": [230, 0],
        "8": [240, 0],
        "9": [250, 0],
        ":": [260, 0],
        ";": [270, 0],
        "<": [280, 0],
        "=": [290, 0],
        ">": [300,0],
        "?": [310,0],

        "@": [0, 10],
        "[": [10, 10],
        "\\": [20, 10],
        "]": [30, 10],
        "^": [40, 10],
        "_": [50, 10],
        "`": [60, 10],
        "{": [70, 10],
        "|": [80, 10],
        "}": [90, 10],
        "~": [100, 10],

        "*": [130, 20],

        "A": [0, 30],
        "B": [10, 30],
        "C": [20, 30],
        "D": [30, 30],
        "E": [40, 30],
        "F": [50, 30],
        "G": [60, 30],
        "H": [70, 30],
        "I": [80, 30],
        "J": [90, 30],
        "K": [100, 30],
        "L": [110, 30],
        "M": [120, 30],
        "N": [130, 30],
        "O": [140, 30],
        "P": [150, 30],
        "Q": [160, 30],
        "R": [170, 30],
        "S": [180, 30],
        "T": [190, 30],
        "U": [200, 30],
        "V": [210, 30],
        "W": [220, 30],
        "X": [230, 30],
        "Y": [240, 30],
        "Z": [250, 30],

        "a": [0, 40],
        "b": [10, 40],
        "c": [20, 40],
        "d": [30, 40],
        "e": [40, 40],
        "f": [50, 40],
        "g": [60, 40],
        "h": [70, 40],
        "i": [80, 40],
        "j": [90, 40],
        "k": [100, 40],
        "l": [110, 40],
        "m": [120, 40],
        "n": [130, 40],
        "o": [140, 40],
        "p": [150, 40],
        "q": [160, 40],
        "r": [170, 40],
        "s": [180, 40],
        "t": [190, 40],
        "u": [200, 40],
        "v": [210, 40],
        "w": [220, 40],
        "x": [230, 40],
        "y": [240, 40],
        "z": [250, 40],
    },
    width: 40,
    height: 40
}