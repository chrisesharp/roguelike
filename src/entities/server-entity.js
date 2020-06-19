"use strict";

import Entity from '../client/javascripts/entity.js';
import { MSGTYPE } from '../messages.js';


export default class ServerEntity extends Entity {
    constructor(properties) {
        super(properties);
        this.messenger = properties['messenger'];
        this.damage = 1;
        this.inventory = [];
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
        this.inventory.push(item);
        this.messenger(this, MSGTYPE.UPD, `You take ${item.describeThe()}.`);
        return true;
    }

    dropItem(itemName) {
        let item;
        for (let i=0; i< this.inventory.length; i++) {
            if (this.inventory[i].name === itemName) {
                item = this.inventory.splice(i,1)[0];
                break;
            }
        }
        if (item) {
            this.messenger(this, MSGTYPE.UPD, `You drop ${item.describeThe()}.`);
        }
        return item;
    }

    getInventory() {
        return this.inventory;
    }
}