"use strict";

import _ from "underscore";
import Brain from './brain.js';
import { DIRS } from "../common/movement.js";

function distance(pos1, pos2) {
    return Math.floor(Math.sqrt((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2));
}

export default class GoblinBrain extends Brain {
    constructor(map, client, messages) {
        super(map, client, messages);
        this.count = 0;
        this.goblin = this.client.getParticipant();
    }
    ready(event, args) {
        console.log("event:",event);
        if (event === 'dead') {
            this.client.disconnectFromServer();
        }

        if (event === 'delete') {
            this.client.sync();
        }

        if (event === 'position') {
            if (args !== this.goblin.id) {
                if (this.currentTarget) {
                    let directions = this.findDirections(this.currentTarget);
                    if (directions.length) {
                        this.client.move(directions.pop());
                    }
                } else {
                    this.count++;
                }
            }
        }

        if (event === 'entities') {
            this.currentTarget = this.findTarget();
            console.log("current target: ", this.currentTarget);
        }

        if (this.count > 10) {
            this.count = 0;
            this.client.sync();
        }
    }

    findTarget() {
        let target;
        let closest = this.goblin.getSightRadius();
        Object.keys(this.client.others).forEach(key => {
            let entity = this.client.others[key];
            let dist = distance(this.goblin.pos, entity.pos);
            if (dist <= closest) {
                closest = dist;
                target = entity;
            }
        });
        return target;
    }

    findDirections(target) {
        let directions = [];
        if (this.goblin.pos.x < target.pos.x) {
            directions.push(DIRS.EAST);
        } else if (this.goblin.pos.x > target.pos.x) {
            directions.push(DIRS.WEST);
        } 
        if (this.goblin.pos.y < target.pos.y) {
            directions.push(DIRS.SOUTH);
        } else if (this.goblin.pos.y > target.pos.y) {
            directions.push(DIRS.NORTH);
        }
        return directions;
    }
}