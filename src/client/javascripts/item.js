"use strict";

import Entity from './entity.js';

export default class Item extends Entity {
    constructor(properties) {
        super(properties);
        this.alive = false;
        this.walkable = true;
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
}