"use strict";

import Entity from '../client/javascripts/entity.js';
import { MSGTYPE } from '../messages.js';


export default class ServerEntity extends Entity {
    constructor(properties) {
        super(properties);
        this.messenger = properties['messenger'];
        this.damage = 1;
        this.ac = 10;
        this.currentWeapon = null;
        this.currentArmour = null;
        this.inventory = [];
    }

    handleCollision(other) {
        if (other.isAlive()) {
            if (this.isWielding()) {
                let dmg = this.dealDamage();
                other.hitFor(dmg);
                this.messenger(this, MSGTYPE.INF, `You hit ${other.name} for ${dmg} damage.`);
            } else {
                this.messenger(this, MSGTYPE.INF, `${other.name} is there.`);
            }
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

    dealDamage() {
        let damage = this.damage;
        if (this.currentWeapon) {
            damage += this.currentWeapon.damage;
        }
        return damage;
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

    eatItem(itemName) {
        let item;
        for (let i=0; i< this.inventory.length; i++) {
            if (this.inventory[i].name === itemName) {
                item = this.inventory.splice(i,1)[0];
                break;
            }
        }
        if (item) {
            this.messenger(this, MSGTYPE.UPD, `You eat ${item.describeThe()}.`);
        } else {
            this.messenger(this, MSGTYPE.INF, `You don't have the ${itemName} to eat.`);
        }
    }

    wield(weaponName) {
        if (weaponName) {
            let weapon = this.inventory.find(o => (o.name === weaponName));
            if (weapon) {
                this.currentWeapon = weapon;
                this.messenger(this, MSGTYPE.UPD, `You are wielding ${weapon.describeA()}.`);
            } else {
                this.messenger(this, MSGTYPE.INF, `You don't have a ${weaponName} to wield.`);
            }
        } else {
            this.currentWeapon = null;
            this.messenger(this, MSGTYPE.UPD, `You are not wielding anything now.`);
        }
        
    }

    isWielding() {
        return this.currentWeapon;
    }

    getInventory() {
        return this.inventory;
    }
}