"use strict";

import Entity from './entity.js';

export default class Item extends Entity {
    constructor(properties={}) {
        super(properties);
        this.alive = false;
        this.walkable = true;
        this.edible = (properties['edible'] !== undefined) ? properties['edible'] : false;
        this.wiedable = (properties['wiedable'] !== undefined) ? properties['wiedable'] : false;
        this.wearable = (properties['wearable'] !== undefined) ? properties['wearable'] : false;
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

    isEdible() {
        return this.edible;
    }

    isWieldable() {
        return this.wiedable;
    }

    isWearable() {
        return this.wearable;
    }
}