"use strict";

export default class Rules {
    constructor(properties) {
        this.random = properties['random'] || (()=> { return Math.random();});
    }

    toHitRoll(attacker, defender) {
        let roll = Math.floor((this.random() * 20));
        let ac = defender.getAC();
        let target = 20 - ac;
        let bonus = attacker.toHitBonus() || 0;
        return (roll + bonus >= target);
    }
}

