"use strict";

import Brain from './brain.js';
import { DIRS } from "../common/movement.js";

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
        if (event === 'position') {
            if (this.currentTarget) {
                let directions = this.findDirections(this.currentTarget);
                if (directions.length) {
                    this.client.move(directions.pop());
                }
            }
        }

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

    findDirections(target) {
        let goblin = this.client.getParticipant();
        let directions = [];
        if (goblin.pos.x < target.pos.x) {
            directions.push(DIRS.EAST);
        } else if (goblin.pos.x > target.pos.x) {
            directions.push(DIRS.WEST);
        } 
        if (goblin.pos.y < target.pos.y) {
            directions.push(DIRS.SOUTH);
        } else if (goblin.pos.y > target.pos.y) {
            directions.push(DIRS.NORTH);
        }
        return directions;
    }
}