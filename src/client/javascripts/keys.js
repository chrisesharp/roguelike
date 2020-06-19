"use strict";

import { KEYS } from './display';

import {DIRS } from './movement';

import { Screens } from './screens/index.js';

export const isReturnKey = function(inputData) {
    return (inputData.keyCode === KEYS.VK_RETURN);
}

export const isEscKey = function(inputData) {
    return (inputData.keyCode === KEYS.VK_ESCAPE);
}

export const isZeroKey = function(inputData) {
    return (inputData.keyCode === KEYS.VK_0);
}

export const isLetterKey = function(inputData) {
    return (inputData.keyCode >= KEYS.VK_A && inputData.keyCode <= KEYS.VK_V);
}

export const letterIndex = function(keyCode) {
    return keyCode - KEYS.VK_A;
}


export const wHandler = function(input) { 
    if (input.shiftKey) {
        this.showItemsSubScreen(Screens.wieldScreen, this.player.getItems(),'You have nothing to wield.');
    } else {
        this.showItemsSubScreen(Screens.wearScreen, this.player.getItems(),'You have nothing to wear.');
    }
    return true;
}

const KEYDOWN = [];
KEYDOWN.push({key:KEYS.VK_LEFT, func: function() { this.move(DIRS.WEST); return false;} });
KEYDOWN.push({key:KEYS.VK_RIGHT, func: function() { this.move(DIRS.EAST); return false;} });
KEYDOWN.push({key:KEYS.VK_UP,    func: function() { this.move(DIRS.NORTH); return false;} });
KEYDOWN.push({key:KEYS.VK_DOWN,  func: function() { this.move(DIRS.SOUTH); return false;} });
KEYDOWN.push({key:KEYS.VK_I,     func: function() { this.showItemsSubScreen(Screens.inventoryScreen, this.player.getInventory(),'You are not carrying anything.'); return true;} });
KEYDOWN.push({key:KEYS.VK_D,     func: function() { this.showItemsSubScreen(Screens.dropScreen, this.player.getInventory(),'You have nothing to drop.'); return true;} });
KEYDOWN.push({key:KEYS.VK_E,     func: function() { this.showItemsSubScreen(Screens.eatScreen, this.player.getInventory(),'You have nothing to eat.'); return true;} });
KEYDOWN.push({key:KEYS.VK_W,     func: wHandler });
KEYDOWN.push({key:KEYS.VK_X,     func: function() { this.showItemsSubScreen(Screens.examineScreen, this.player.getInventory(),'You have nothing to examine.'); return true;} });
KEYDOWN.push({key:KEYS.VK_COMMA, func: function() { this.showPickupSubScreen(); return true;} });

const KEYPRESS = [];
KEYPRESS.push({char: ">", func: function() { this.move(DIRS.DOWN); return false; } });
KEYPRESS.push({char: "<", func: function() { this.move(DIRS.UP); return false;} });
KEYPRESS.push({char: "?", func: function() { this.setSubScreen(Screens.helpScreen); return true;} });
KEYPRESS.push({char: ";", func: function() { this.showLookScreen(); return true;} });

export const getHandler = function(inputType, inputData) {
    let handler = null;
    if (inputType === 'keydown') {
        handler = KEYDOWN.find(o => o.key === inputData.keyCode);
    } else if (inputType === 'keypress') {
        let keyChar = String.fromCharCode(inputData.charCode);
        handler = KEYPRESS.find(o => o.char === keyChar);
    }
    return handler;
}