"use strict";

import Entity from '../client/javascripts/entity.js';
import { MSGTYPE } from '../messages.js';


export default class ServerEntity extends Entity {
    constructor(properties) {
        super(properties);
        this.messenger = properties['messenger'];
        this.damage = 1;
    }

    handleCollision(other) {
        if (other.isAlive()) {
            this.messenger(this, MSGTYPE.INF, `${other.name} is there.`);
            other.hitFor(this.damage);
        } else {
            this.messenger(this, MSGTYPE.INF, `You see a dead ${other.name}.`);
        }
    }

    hitFor(damage) {
        this.hitPoints -= damage;
        if (this.isAlive()) {
            this.messenger(this, MSGTYPE.UPD, "Ouch!");
        } else {
            this.messenger(this, MSGTYPE.UPD, "You died!");
        }   
    }

    tryTake(item) {
        return true;
    }
}