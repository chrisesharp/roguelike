"use strict";

import Item from './item.js';


export default class Entity extends Item {
    constructor(properties = {}) {
        super(properties);
        this.id = properties['id'];
        this.alive = (properties['alive'] !== undefined) ? properties['alive'] : true;
        this.name = properties['name'] || "anonymous";
        this.role = properties['role'] || "unknown";
        this.type = properties['type'];
        if (this.char === ' ') { 
            this.setGlyph({'char':"?"});
        }
        this.speed = properties['speed'] || 1000;
        this.maxHitPoints = (properties['hp'] !== undefined) ? properties['hp'] : 1;
        this.hitPoints = this.maxHitPoints;
        this.hunger = (properties['hunger'] !== undefined) ? properties['hunger'] : {value:0, description:"not hungry"};
        this.sight = 10;
        this.currentArmour = properties['currentArmour'] || null;
        this.currentWeapon = properties['currentWeapon'] || null;
        this.ac = properties['ac'] || 10;
        this.inventory = [];
    }

    getName() {
        return this.name;
    }

    getDescription() {
        return this.role;
    }

    getSightRadius() {
        return this.sight;
    }

    getHitPoints() {
        return this.hitPoints;
    }

    getMaxHitPoints() {
        return this.maxHitPoints;
    }

    getAC() {
        return this.ac;
    }

    getHunger() {
        return this.hunger.description;
    }

    isAlive() {
        if (this.hitPoints <=0) {
            this.alive = false;
        }
        return this.alive;
    }

    getInventory() {
        return this.inventory;
    }

    getArmour() {
        return (this.currentArmour) ? this.currentArmour.name : "";
    }

    getWeapon() {
        return (this.currentWeapon) ? this.currentWeapon.name : "";
    }
}