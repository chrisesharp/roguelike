'use strict';

import { Color } from '../display.js';
import { game } from '../game.js';
import { getSpectatorHandler } from '../keys.js';
import { Glyph } from '../../../common/glyph';

class SpectateScreen {
    
    constructor() {
        this.screenWidth = null;
        this.screenHeight = null;
        this.trackedEntityIndex = 0;
    }

    getTrackedEntity() {
        return game.getOtherEntities()[this.trackedEntityIndex];
    }

    enter() {
        this.screenWidth = game.getScreenWidth();
        this.screenHeight = game.getScreenHeight();
    }

    render(display) {
        this.renderMap(display);
        this.renderMessages();
        this.renderStats();
    }

    renderMap(display) {
        let map = game.getMap();
        let topLeft = this.getScreenOffsets(map);
        for (let x = topLeft.x; x < topLeft.x + this.screenWidth; x++) {
            for (let y = topLeft.y; y < topLeft.y + this.screenHeight; y++) {
                let glyph = this.getColouredGlyph(map, x, y, this.getTrackedEntity().getPos().z);
                display.draw(x - topLeft.x,
                                y - topLeft.y, 
                                glyph.getChar(), glyph.getForeground(), glyph.getBackground());
            }
        }
    }

    getScreenOffsets(map) {
        let topLeftX = Math.max(0, this.getTrackedEntity().getPos().x - Math.round(this.screenWidth / 2));
        topLeftX = Math.min(topLeftX, Math.max(0, map.getWidth() - this.screenWidth));
        let topLeftY = Math.max(0, this.getTrackedEntity().getPos().y - Math.round(this.screenHeight / 2));
        topLeftY = Math.min(topLeftY, Math.max(0, map.getHeight() - this.screenHeight));
        return {
            x: topLeftX,
            y: topLeftY
        };
    }

    getColouredGlyph(map, x, y, z) {
        let glyph = map.getTile(x, y, z);
        let foreground = Color.fromString('#211');
        let items = game.getItemsAt(x, y, z);
        if (items.length > 0) {
            glyph = items.slice(-1)[0];
        }
        if (game.getEntityAt(x, y, z)) {
            glyph = game.getEntityAt(x, y, z);
        }
        let itemColour = Color.fromString(glyph.getForeground());
        if (glyph.id === this.getTrackedEntity().id) {
            itemColour = Color.fromString('lightblue');
        }
        foreground = Color.interpolate(foreground, itemColour, 1);
        return new Glyph({'char': glyph.getChar(), 'foreground':Color.toRGB(foreground),'background':glyph.getBackground()});
    }

    renderMessages() {
        let messages = game.getMessages();
        for (let i = 0; i < messages.length; i++) {
            game.updateMessages(messages[i]);
        }
        game.clearMessages();
    }

    renderStats() {
        let statsHTML = '<hr>';
        for (let [i, entity] of game.getOtherEntities().entries()) {
            if (entity.isAlive()) {
                let colour = i === this.trackedEntityIndex ? 'lightblue' : entity.getForeground();
                statsHTML += '<span style="color:' + colour + '">';
                statsHTML += entity.getName() + ' | ';
                statsHTML += 'HP: ' + entity.getHitPoints() + ' | ';
                let pos = entity.getPos();
                statsHTML += pos.x + ', ' + pos.y + ', ' + pos.z + ' | ';
                for (let item of entity.getInventory()) {
                    statsHTML += item.getChar();
                };
                statsHTML += '</span><br />';
            }
        }
        game.setStats(statsHTML);
    }

    handleInput(inputType, inputData) {   
        let handler = getSpectatorHandler(inputType, inputData);
        if (handler) {
            handler.func.call(this,inputData);
        }
    }

    spectatePreviousPlayer() {
        if (game.getOtherEntities().length == 0) {
            return;
        }

        do {
            this.trackedEntityIndex--;
            if (this.trackedEntityIndex === -1) {
                this.trackedEntityIndex = game.getOtherEntities().length - 1;
            }
        } while (!this.getTrackedEntity().isAlive());
    }

    spectateNextPlayer() {
        if (game.getOtherEntities().length == 0) {
            return;
        }

        do {
            this.trackedEntityIndex++;
            if (this.trackedEntityIndex >= game.getOtherEntities().length) {
                this.trackedEntityIndex = 0;
            }
        } while (!this.getTrackedEntity().isAlive());
    }

}

export const spectateScreen = new SpectateScreen();
