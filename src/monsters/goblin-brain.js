"use strict";

import Brain from './brain.js';

function distance(pos1, pos2) {
    return Math.floor(Math.sqrt((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2));
}

function keyToPos(key, z) {
    let parts = key.split(',');
    let x = parts[0].slice(1);
    let y = parts[1].split(')')[0];
    return {x:x, y:y, z:z};
}

export default class GoblinBrain extends Brain {
    ready(event) {
        if (event === 'entities') {
            this.currentTarget = this.findTarget();
        }
    }

    findTarget() {
        let goblin = this.client.getParticipant();
        let target;
        let closest = goblin.getSightRadius();
        Object.keys(this.client.others).forEach(key => {
            let dist = distance(goblin.pos, keyToPos(key, goblin.pos.z));
            if (dist <= closest) {
                closest = dist;
                target = this.client.others[key];
            }
        });
        return target;
    }
}