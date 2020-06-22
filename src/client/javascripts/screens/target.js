"use strict";

import { game } from '../game.js';
import { isReturnKey, isEscKey } from '../keys.js';
import { KEYS } from '../display.js';
import  Tile  from '../tile.js';
import Geometry from '../geometry.js';

const KEYDOWN = [];
KEYDOWN.push({key:KEYS.VK_LEFT, func: function() { this.move(-1, 0, 0); return false;} });
KEYDOWN.push({key:KEYS.VK_RIGHT, func: function() { this.move(1, 0, 0); return false;} });
KEYDOWN.push({key:KEYS.VK_UP,    func: function() { this.move(0, -1, 0); return false;} });
KEYDOWN.push({key:KEYS.VK_DOWN,  func: function() { this.move(0, 1, 0); return false;} });

const getHandler = function(inputType, inputData) {
    let handler = null;
    if (inputType === 'keydown') {
        handler = KEYDOWN.find(o => o.key === inputData.keyCode);
    } else if (inputType === 'keypress') {
        let keyChar = String.fromCharCode(inputData.charCode);
        handler = KEYPRESS.find(o => o.char === keyChar);
    }
    return handler;
}

export default class TargetBasedScreen {
    constructor(template) {
        template = template || {};
        this.okFunction = template['okFunction'] || function(x, y) {
            return false;
        }
        this.captionFunction = template['captionFunction'] || function(x, y) {
            return '';
        }
    }
    
    setup(player, offsetX, offsetY) {
        this.player = player;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.startX = player.pos.x - offsetX;
        this.startY = player.pos.y - offsetY;
        this.cursorX = this.startX;
        this.cursorY = this.startY;

        // Cache the FOV
        let visibleCells = {};
        game.getMap().getFov(this.player.pos.z).compute(
            this.player.pos.x, this.player.pos.y, 
            this.player.getSightRadius(), 
            function(x, y, radius, visibility) {
                visibleCells[x + "," + y] = true;
            });
        this.visibleCells = visibleCells;
    }

    render(display) {
        game.getScreen().renderTiles.call(game.getScreen(), display);
        let points = Geometry.getLine(this.startX, this.startY, this.cursorX,
            this.cursorY);

        for (let i = 0; i < points.length; i++) {
            display.drawText(points[i].x, points[i].y, '%c{magenta}*');
        }

        display.drawText(0, game.getScreenHeight() - 1,
            this.captionFunction(this.cursorX + this.offsetX, this.cursorY + this.offsetY));
    }

    handleInput(inputType, inputData) {
        if (isEscKey(inputData)) {
            game.getScreen().setSubScreen(undefined);
        } else if (isReturnKey(inputData)) {
            this.executeOkFunction();
        } else if (inputType == 'keydown') {
            let handler = getHandler(inputType, inputData);
            if (handler) {
                handler.func.call(this, inputData);
            }
        }
        game.refresh();
    }

    isCancelCondition(inputData) {
        return (isEscKey(inputData) || 
                    (isReturnKey(inputData) && 
                        (!this.canSelectItem || 
                        Object.keys(this.selectedIndices).length === 0)
                    )
                );
    }

    move(dx, dy) {
        this.cursorX = Math.max(0, Math.min(this.cursorX + dx, game.getScreenWidth()));
        this.cursorY = Math.max(0, Math.min(this.cursorY + dy, game.getScreenHeight() - 1));
    }

    executeOkFunction() {
        game.getScreen().setSubScreen(undefined);
        if (this.okFunction(this.cursorX + this.offsetX, this.cursorY + this.offsetY)) {
            this.player.getMap().getEngine().unlock();
        }
    }

    showItemsSubScreen() {

    }

    showPickupSubScreen() {
        
    }
};

export const lookScreen = new TargetBasedScreen({
    captionFunction: function(x, y) {
        const nullTile = new Tile();
        let z = this.player.pos.z;
        let map = game.getMap();
        let element = nullTile.getRepresentation();
        let description = nullTile.getDescription();
        let details;
        if (map.isExplored(x, y, z)) {
            element = map.getTile(x, y, z).getRepresentation();
            description = map.getTile(x, y, z).getDescription();
            if (this.visibleCells[x + ',' + y]) {
                let items = game.getItemsAt(x, y, z);
                if (items) {
                    let item = items[items.length - 1];
                    element = item.getRepresentation();
                    description = item.describeA(true);
                    details = item.getDetails();
                } else if (game.getEntityAt(x, y, z)) {
                    let entity = game.getEntityAt(x, y, z);
                    element = entity.getRepresentation();
                    description = entity.getDescription();
                    details = entity.getDetails();
                }
            }
        }
        let message = (details) ? `${element} - ${description} (${details})` : `${element} - ${description}`;
        return message;
    }
});