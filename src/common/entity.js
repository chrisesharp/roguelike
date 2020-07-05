"use strict";

import Glyph from './glyph.js';


export default class Entity extends Glyph {
    constructor(properties = {}) {
        super(properties);
        this.pos = properties['pos'] || {"x":0, "y":0, "z":0};
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
        this.details = properties['details'] || "none";
        this.currentArmour = properties['currentArmour'] || null;
        this.currentWeapon = properties['currentWeapon'] || null;
        this.ac = properties['ac'] || 10;
        this.inventory = [];
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

    setGlyph(properties) {
        this.char = properties['char'] || this.char;
        this.foreground = properties['foreground'] || this.foreground;
        this.background = properties['background'] || this.background;
    }

    getGlyph() {
        return new Glyph({char:this.char, foreground:this.foreground, background:this.background});
    }

    assume(extraProperties) {
        if (extraProperties) {
            for (let key in extraProperties) {
                this[key] = extraProperties[key];
            }
        }
    }

    getDescription() {
        return this.name;
    }

    getDetails() {
        return this.details;
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