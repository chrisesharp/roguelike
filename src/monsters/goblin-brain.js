"use strict";

import _ from "underscore";
import Brain from './brain.js';
import { DIRS, getMovement, opposite, left, right } from "../common/movement.js";
import { EVENTS } from "../common/events";

function distance(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

export default class GoblinBrain extends Brain {
    constructor(map, client, messages) {
        super(map, client, messages);
        this.syncCount = 0;
        this.goblin = this.client.getEntity();
        this.speed = 3;
        this.nextMove = null;
    }

    ready(event) {
        switch(event) {
            case EVENTS.dead:
                this.client.disconnectFromServer();
                break;
            case EVENTS.delete:
                this.client.sync();
                break;
            case EVENTS.ping:
                if (this.currentTarget && this.isSameLevel(this.currentTarget)) {
                    let directions = this.findDirections(this.currentTarget);
                    this.nextMove = this.chooseDirection(directions);
                    this.client.move(this.nextMove);
                } else {
                    this.syncCount++;
                }
                break;
            case EVENTS.entities:
                this.currentTarget = this.findTarget();
                break;
        }

        if (this.syncCount > 10) {
            this.syncCount = 0;
            this.client.sync();
        }
    }

    findTarget() {
        let target;
        let closest = this.goblin.getSightRadius();
        this.client.getOtherEntities().forEach( entity => {
            if (entity.role === this.goblin.role) {
                return;
            }
            let dist = distance(this.goblin.getPos(), entity.getPos());
            if (dist <= closest) {
                closest = dist;
                target = entity;
            }
        });
        return target;
    }

    findDirections(target) {
        let directions = [];
        if (this.goblin.getPos().x < target.getPos().x) {
            directions.push(DIRS.EAST);
        } else if (this.goblin.getPos().x > target.getPos().x) {
            directions.push(DIRS.WEST);
        } 
        if (this.goblin.getPos().y < target.getPos().y) {
            directions.push(DIRS.SOUTH);
        } else if (this.goblin.getPos().y > target.getPos().y) {
            directions.push(DIRS.NORTH);
        }
        return directions;
    }

    chooseDirection(directions) {
        let options = [];
        let alternatives = [];
        directions.forEach(dir => {
            let pos = this.nextPos(dir);
            let tile = this.map.getTile(pos.x, pos.y, pos.z);
            if (tile.isWalkable() || _.isEqual(pos, this.currentTarget.getPos())) {
                options.push(dir);
            } else {
                alternatives.push(left(dir));
                alternatives.push(right(dir));
            }
        });
        if (!options.length) {
            alternatives.forEach(dir => {
                let pos = this.nextPos(dir);
                let tile = this.map.getTile(pos.x, pos.y, pos.z);
                if (tile.isWalkable()) {
                    options.push(dir);
                }
            });
        }
        if (!options.length) {
            directions.forEach(dir => {
                let pos = this.nextPos(opposite(dir));
                let tile = this.map.getTile(pos.x, pos.y, pos.z);
                if (tile.isWalkable()) {
                    options.push(opposite(dir));
                }
            });
        }
        return this.randomOption(options);
    }

    nextPos(dir) {
        let delta = getMovement(dir);
        let x = this.goblin.getPos().x + delta.x;
        let y = this.goblin.getPos().y + delta.y;
        let z = this.goblin.getPos().z + delta.z;
        return {x:x, y:y, z:z};
    }

    isSameLevel(entity) {
        return (entity.getPos().z === this.goblin.getPos().z);
    }

    randomOption(options) {
        return options[Math.floor(Math.random() * options.length)];
    }
}