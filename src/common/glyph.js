"use strict";

export default class Glyph { 
    constructor(properties) {
        this.char = properties['char'] || ' ';
        this.foreground = properties['foreground'] || 'white';
        this.background = properties['background'] || 'black';
    }

    getChar(){ 
        return this.char; 
    }

    getBackground() {
        return this.background;
    }

    getForeground() { 
     return this.foreground; 
    }

    getRepresentation() {
        return '%c{' + this.foreground + '}%b{' + this.background + '}' + this.char +
            '%c{white}%b{black}';
    }
};
