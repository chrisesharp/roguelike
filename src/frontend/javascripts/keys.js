"use strict";

import { KEYS } from './display';
import { DIRS } from '../../common/movement';
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
        this.showItemsSubScreen(Screens.wieldScreen, this.player.getInventory(),'You have nothing to wield.');
    } else {
        this.showItemsSubScreen(Screens.wearScreen, this.player.getInventory(),'You have nothing to wear.');
    }
}


const KEYDOWN = [];
KEYDOWN.push({key:KEYS.VK_LEFT,  func: function(input) { if (input.shiftKey) this.dig(DIRS.WEST); else this.move(DIRS.WEST); } });
KEYDOWN.push({key:KEYS.VK_RIGHT, func: function(input) { if (input.shiftKey) this.dig(DIRS.EAST); else this.move(DIRS.EAST); } });
KEYDOWN.push({key:KEYS.VK_UP,    func: function(input) { if (input.shiftKey) this.dig(DIRS.NORTH); else this.move(DIRS.NORTH); } });
KEYDOWN.push({key:KEYS.VK_DOWN,  func: function(input) { if (input.shiftKey) this.dig(DIRS.SOUTH); else this.move(DIRS.SOUTH); } });
KEYDOWN.push({key:KEYS.VK_I,     func: function() { this.showItemsSubScreen(Screens.inventoryScreen, this.player.getInventory(),'You are not carrying anything.');} });
KEYDOWN.push({key:KEYS.VK_D,     func: function() { this.showItemsSubScreen(Screens.dropScreen, this.player.getInventory(),'You have nothing to drop.');} });
KEYDOWN.push({key:KEYS.VK_E,     func: function() { this.showItemsSubScreen(Screens.eatScreen, this.player.getInventory(),'You have nothing to eat.');} });
KEYDOWN.push({key:KEYS.VK_W,     func: wHandler });
KEYDOWN.push({key:KEYS.VK_X,     func: function() { this.showItemsSubScreen(Screens.examineScreen, this.player.getInventory(),'You have nothing to examine.');} });
KEYDOWN.push({key:KEYS.VK_COMMA, func: function() { this.showPickupSubScreen();} });

const KEYPRESS = [];
KEYPRESS.push({char: ">", func: function() { this.move(DIRS.DOWN);} });
KEYPRESS.push({char: "<", func: function() { this.move(DIRS.UP);} });
KEYPRESS.push({char: "?", func: function() { this.setSubScreen(Screens.helpScreen);} });
KEYPRESS.push({char: ";", func: function() { this.showLookScreen();} });

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

export const getSpectatorHandler = function(inputType, inputData) {
    let handler = null;
    if (inputType === 'keydown') {
        if (inputData.keyCode === KEYS.VK_UP) {
            handler = { func: function() { this.spectatePreviousPlayer() }};
        } else if (inputData.keyCode === KEYS.VK_DOWN) {
            handler = { func: function() { this.spectateNextPlayer() }};
        }
    }
    return handler;
}