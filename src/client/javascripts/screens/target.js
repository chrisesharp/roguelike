"use strict";

import Screen from './screen.js';
import { game } from '../game.js';
import { isReturnKey, isEscKey, getHandler } from '../keys.js';
import  Tile  from '../tile.js';
import Geometry from '../geometry.js';
import { getMovement } from '../movement.js';

export default class TargetBasedScreen extends Screen {    
    setup(player, offsetX, offsetY) {
        this.player = player;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.startX = player.pos.x - offsetX;
        this.startY = player.pos.y - offsetY;
        this.cursorX = this.startX;
        this.cursorY = this.startY;
        this.map = game.getMap();

        let visibleCells = {};
        this.map.getFov(this.player.pos.z).compute(
            this.player.pos.x, this.player.pos.y, 
            this.player.getSightRadius(), 
            function(x, y, radius, visibility) {
                visibleCells[x + "," + y] = true;
            });
        this.visibleCells = visibleCells;
    }

    render(display) {
        game.getScreen().renderTiles.call(game.getScreen(), display);
        this.renderCursor(display);
        let caption = this.captionFunction(this.cursorX + this.offsetX, this.cursorY + this.offsetY);
        display.drawText(0, game.getScreenHeight() - 1, caption);
    }

    renderCursor(display) {
        let points = Geometry.getLine(this.startX, this.startY, this.cursorX, this.cursorY);
        for (let i = 0; i < points.length; i++) {
            display.drawText(points[i].x, points[i].y, '%c{magenta}*');
        }
    }

    getTargets() {
        let x = this.cursorX + this.offsetX;
        let y = this.cursorY + this.offsetY;
        let z = this.player.pos.z;
        let tile = new Tile();
        let item = false;
        let entity = false;
        if (this.map.isExplored(x, y, z)) {
            tile = this.map.getTile(x, y, z);
            if (this.visibleCells[x + ',' + y]) {
                let items = game.getItemsAt(x, y, z);
                if (items) {
                    item = items[items.length - 1];
                }
                if (game.getEntityAt(x, y, z)) {
                    entity = game.getEntityAt(x, y, z);
                }
            }
        }
        return [entity, item, tile];
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

    showItemsSubScreen() {

    }

    showPickupSubScreen() {
        
    }
};

export const lookScreen = new TargetBasedScreen({
    ok: function(x, y) { return {x:x, y:y};},
    caption: function(x, y) {
        let objects = this.getTargets();
        let i = 0;
        let object = objects[i];
        while (!object) {
            i++;
            object = objects[i];
        }
        let element = object.getRepresentation();
        let description = object.getDescription();
        let details = (object.getDetails) ? object.getDetails() : false;
        return (details) ? `${element} - ${description} (${details})` : `${element} - ${description}`;
    }
});