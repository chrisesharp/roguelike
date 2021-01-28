"use strict";

import Entity from '../../common/entity.js';
import { MSGTYPE, Messages } from '../messages.js';
import Rules from '../rules.js';

const hungerLevels = {
    0: "not hungry",
    1: "hungry",
    2: "starving"
};

export default class ServerEntity extends Entity {
    constructor(properties) {
        super(properties);
        this.id = properties['id'];
        this.corpse = properties['corpse'];
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
            let msg = (other.length === 1) ? Messages.SINGLE_ITEM(other[0]) : Messages.MULTIPLE_ITEMS();
            this.messenger(this, MSGTYPE.INF, msg);
        } else if (other.isAlive()) {
            if (this.isWielding()) {
                this.attack(other);
            } else {
                this.messenger(this, MSGTYPE.INF, Messages.ENTITY_THERE(other));
            }
        } else {
            this.messenger(this, MSGTYPE.INF, Messages.ENTITY_DEAD(other));
        }
    }

    attack(other) {
        if (this.tryToHit(other)) {
            let dmg = this.dealDamage();
            other.hitFor(dmg);
            this.messenger(this, MSGTYPE.INF, Messages.HIT_BY(other, dmg));
            this.messenger(other, MSGTYPE.INF, Messages.HIT_OTHER(this, dmg));
        } else {
            this.messenger(this, MSGTYPE.INF, Messages.YOU_MISSED(other));
            this.messenger(other, MSGTYPE.INF, Messages.MISSED_YOU(this));
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
            this.messenger(this, MSGTYPE.UPD, Messages.TAKE_DMG(damage));
        } else {
            this.messenger(this, MSGTYPE.UPD, Messages.DIED(this));
        }   
    }

    tryTake(item) {
        this.inventory.push(item);
        this.messenger(this, MSGTYPE.UPD, Messages.TAKE_ITEM(item));
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
            this.messenger(this, MSGTYPE.UPD, Messages.DROP_ITEM(item));
        }
        return item;
    }

    eat(foodName) {
        let item = this.removeItemFromInventory(foodName);
        if (item) {
            this.messenger(this, MSGTYPE.UPD, Messages.EAT_FOOD(item));
        } else {
            this.messenger(this, MSGTYPE.INF, Messages.NO_EAT(foodName));
        }
    }

    wield(weaponName) {
        if (weaponName) {
            this.use(weaponName, "wield");
        } else {
            this.currentWeapon = null;
            this.messenger(this, MSGTYPE.UPD, Messages.NO_WIELD(weaponName));
        }
    }

    wear(armourName) {
        if (armourName) {
            this.use(armourName, "wear");
        } else {
            this.setAC(null);
            this.messenger(this, MSGTYPE.UPD, Messages.NO_WEAR(armourName));
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
            this.messenger(this, MSGTYPE.UPD, Messages.USE_ITEM(verb, item));
        } else {
            this.messenger(this, MSGTYPE.INF, Messages.NO_USE(verb, itemName));
        }
    }

    isWielding() {
        return this.currentWeapon;
    }

    setAC(armour) {
        this.currentArmour = armour;
        let ac = this.base_ac;
        if (this.currentArmour) {
            ac += this.currentArmour.ac;
        }
        this.ac = ac;
    }

    getPos() {
        return {id:this.id, pos:this.pos};
    }
}