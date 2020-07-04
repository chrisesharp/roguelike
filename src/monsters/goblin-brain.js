"use strict";

import _ from "underscore";
import Brain from './brain.js';
import { DIRS, getMovement, opposite } from "../common/movement.js";

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
                    this.client.move(this.chooseDirection(directions));
                } else {
                    this.count++;
                }
            }
        }

        if (event === 'entities') {
            this.currentTarget = this.findTarget();
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

    chooseDirection(directions) {
        let direction;
        directions.forEach(dir => {
            let pos = this.nextPos(dir);
            let tile = this.map.getTile(pos.x, pos.y, pos.z);
            if (tile.isWalkable() || _.isEqual(pos, this.currentTarget.pos)) {
                direction = dir;
            }
        });
        if (direction === undefined) {
            directions.forEach(dir => {
                let pos = this.nextPos(opposite(dir));
                let tile = this.map.getTile(pos.x, pos.y, pos.z);
                if (tile.isWalkable()) {
                    direction = opposite(dir);
                }
            });
        }
        return direction;
    }

    nextPos(dir) {
        let delta = getMovement(dir);
        let x = this.goblin.pos.x + delta.x;
        let y = this.goblin.pos.y + delta.y;
        let z = this.goblin.pos.z + delta.z;
        return {x:x, y:y, z:z};

    }
}