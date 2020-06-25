"use strict";

import Entity from '../client/javascripts/entity.js';
import { MSGTYPE } from '../messages.js';
import Rules from '../rules.js';

const hungerLevels = {
    0: "not hungry",
    1: "hungry",
    2: "starving"
};

export default class ServerEntity extends Entity {
    constructor(properties) {
        super(properties);
        this.rules = new Rules(properties);
        this.messenger = properties['messenger'];
        this.damage = 1;
        this.hitBonus = 0;
        this.base_ac = 10;
        this.ac = 10;;
        this.hungerLevel = 0
        this.hunger = this.getHunger();
        this.currentWeapon = null;
        this.currentArmour = null;
        this.inventory = [];
    }

    handleCollision(other) {
        if (other instanceof Array) {
            let msg = (other.length === 1) ? `You see ${[other[0].describeA()]}.` : "There are several objects here.";
            this.messenger(this, MSGTYPE.INF, msg);
        } else if (other.isAlive()) {
            if (this.isWielding()) {
                this.attack(other);
            } else {
                this.messenger(this, MSGTYPE.INF, `${other.name} is there.`);
            }
        } else {
            this.messenger(this, MSGTYPE.INF, `You see a dead ${other.name}.`);
        }
    }

    attack(other) {
        if (this.tryToHit(other)) {
            let dmg = this.dealDamage();
            other.hitFor(dmg);
            this.messenger(this, MSGTYPE.INF, `You hit ${other.name} for ${dmg} damage.`);
            this.messenger(other, MSGTYPE.INF, `${this.name} hit you for ${dmg} damage.`);
        } else {
            this.messenger(this, MSGTYPE.INF, `You missed ${other.name}!`);
            this.messenger(other, MSGTYPE.INF, `${this.name} missed you.`);
        }
    }

    getHunger() {
        let level = Math.floor(this.hungerLevel);
        return {value:level,description:hungerLevels[level]};
    }

    exertion(effort) {
        this.hungerLevel += effort/20;
        this.hunger = this.getHunger();
    }

    toHitBonus() {
        return this.hitBonus;
    }

    tryToHit(other) {
        this.exertion(1);
        return this.rules.toHitRoll(this, other);
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

    removeItemFromInventory(itemName) {
        let item;
        for (let i=0; i< this.inventory.length; i++) {
            if (this.inventory[i].name === itemName) {
                item = this.inventory.splice(i,1)[0];
                break;
            }
        }
        return item;
    }

    dropItem(itemName) {
        let item = this.removeItemFromInventory(itemName);
        if (item) {
            if (this.currentArmour === item) {
                this.wear();
            } else if (this.currentWeapon === item) {
                this.wield();
            }
            this.messenger(this, MSGTYPE.UPD, `You drop ${item.describeThe()}.`);
        }
        return item;
    }

    eat(itemName) {
        let item = this.removeItemFromInventory(itemName);
        if (item) {
            this.messenger(this, MSGTYPE.UPD, `You eat ${item.describeThe()}.`);
        } else {
            this.messenger(this, MSGTYPE.INF, `You don't have the ${itemName} to eat.`);
        }
    }

    wield(weaponName) {
        if (weaponName) {
            this.use(weaponName, "wield");
        } else {
            this.currentWeapon = null;
            this.messenger(this, MSGTYPE.UPD, `You are not wielding anything now.`);
        }
    }

    wear(armourName) {
        if (armourName) {
            this.use(armourName, "wear");
        } else {
            this.setAC(null);
            this.messenger(this, MSGTYPE.UPD, `You are not wearing anything now.`);
        }
    }

    use(itemName, verb) {
        let item = this.inventory.find(o => (o.name === itemName));
        if (item) {
            if (item.wearable) {
                this.setAC(item);
            } else {
                this.currentWeapon = item;
            }
            this.messenger(this, MSGTYPE.UPD, `You are ${verb}ing ${item.describeThe()}.`);
        } else {
            this.messenger(this, MSGTYPE.INF, `You don't have any ${itemName} to ${verb}.`);
        }
    }

    isWielding() {
        return this.currentWeapon;
    }

    getInventory() {
        return this.inventory;
    }

    setAC(armour) {
        this.currentArmour = armour;
        let ac = this.base_ac;
        if (this.currentArmour) {
            ac += this.currentArmour.ac;
        }
        this.ac = ac;
    }

    getAC() {
        return this.ac;
    }
}