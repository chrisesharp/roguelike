"use strict";

import { game } from '../game.js';
import { isReturnKey, isEscKey, getHandler } from '../keys.js';
import  Tile  from '../tile.js';
import Geometry from '../geometry.js';
import { getMovement } from '../movement.js';

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
        let points = Geometry.getLine(this.startX, this.startY, this.cursorX, this.cursorY);
        for (let i = 0; i < points.length - 1; i++) {
            display.drawText(points[i].x, points[i].y, '%c{magenta}*');
        }
        display.drawText(points[points.length-1].x, points[points.length-1].y, '%c{magenta}*')
        let caption = this.captionFunction(this.cursorX + this.offsetX, this.cursorY + this.offsetY);
        display.drawText(0, game.getScreenHeight() - 1, caption);
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

    move(direction) {
        let movement = getMovement(direction);
        let dx = movement.x;
        let dy = movement.y;
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
        return (details) ? `${element} - ${description} (${details})` : `${element} - ${description}`;
    }
});