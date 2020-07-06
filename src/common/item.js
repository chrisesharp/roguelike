"use strict";

import Glyph from './glyph.js';

export default class Item extends Glyph {
    constructor(properties={}) {
        super(properties);
        this.alive = false;
        this.walkable = true;
        this.pos = properties['pos'] || {"x":0, "y":0, "z":0};
        this.name = properties['name'] || "thing";
        this.details = properties['details'] || "none";
        this.edible = (properties['edible'] !== undefined) ? properties['edible'] : false;
        this.wiedable = (properties['wiedable'] !== undefined) ? properties['wiedable'] : false;
        this.wearable = (properties['wearable'] !== undefined) ? properties['wearable'] : false;
    }

    getDescription() {
        return this.name;
    }

    describeA(capitalize) {
        let prefixes = capitalize ? ['A', 'An'] : ['a', 'an'];
        let string = this.getDescription();
        let firstLetter = string.charAt(0).toLowerCase();
        let prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0;
        return prefixes[prefix] + ' ' + string;
    }

    describeThe(capitalize) {
        let prefix = capitalize ? 'The' : 'the';
        return prefix + ' ' + this.getDescription();
    }

    getDetails() {
        return this.details;
    }

    isEdible() {
        return this.edible;
    }

    isWieldable() {
        return this.wiedable;
    }

    isWearable() {
        return this.wearable;
    }

    setGlyph(properties) {
        this.char = properties['char'] || this.char;
        this.foreground = properties['foreground'] || this.foreground;
        this.background = properties['background'] || this.background;
    }

    getGlyph() {
        return new Glyph({char:this.char, foreground:this.foreground, background:this.background});
    }

    assume(extraProperties) {
        if (extraProperties) {
            for (let key in extraProperties) {
                this[key] = extraProperties[key];
            }
        }
    }
}