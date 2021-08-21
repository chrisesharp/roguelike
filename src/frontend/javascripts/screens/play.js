"use strict";

import { Color } from '../display.js';
import { game } from '../game.js';
import { getHandler, isReturnKey } from '../keys.js';
import { loseScreen }  from './lose.js';
import { teleportScreen }  from './teleport.js';
import { pickupScreen } from './item-list.js';
import { lookScreen } from './target.js';
import { Glyph } from '../../../common/glyph';
import { getMovement } from '../../../common/movement';


class PlayScreen {
    constructor() {
        this.gameEnded = false;
        this.subScreen = null;
        this.screenWidth = null;
        this.screenHeight = null;
        this.map = null;
        this.player = null;
    }

    enter() {
        this.screenWidth = game.getScreenWidth();
        this.screenHeight = game.getScreenHeight();
        this.player = game.getEntity();
        this.subScreen = null;
    }

    exit() { 
        console.log("Exited play screen.");
    }

    render(display) {
        if (this.subScreen) {
            this.subScreen.render(display);
            return;
        }
        this.renderTiles(display);
        this.renderMessages();
        this.renderStats();
    }

    getScreenOffsets(map) {
        let topLeftX = Math.max(0, this.player.getPos().x - (this.screenWidth / 2));
        topLeftX = Math.min(topLeftX, Math.max(0, map.getWidth() - this.screenWidth));
        let topLeftY = Math.max(0, this.player.getPos().y - (this.screenHeight / 2));
        topLeftY = Math.min(topLeftY, Math.max(0, map.getHeight() - this.screenHeight));
        return {
            x: topLeftX,
            y: topLeftY
        };
    }

    renderTiles(display) {
        let visibleCells = {};
        let level = this.player.getPos().z;
        let viewDist = this.player.getSightRadius();
        let map = game.getMap();
        map.getFov(level).compute(
            this.player.getPos().x, this.player.getPos().y, viewDist, 
            function(x, y, radius, visibility) {
                let dist = (viewDist - radius)/viewDist;
                visibleCells[x + "," + y] = visibility * dist;
                map.setExplored(x, y, level, true);
            });
        this.renderMap(display, map, visibleCells, level);
    }

    renderMap(display, map, visibleCells, z) {
        let topLeft = this.getScreenOffsets(map);
        for (let x = topLeft.x; x < topLeft.x + this.screenWidth; x++) {
            for (let y = topLeft.y; y < topLeft.y + this.screenHeight; y++) {
                if (map.isExplored(x, y, z)) {
                    let glyph = this.getColouredGlyph(map, visibleCells, x, y, z);
                    display.draw(x - topLeft.x,
                                 y - topLeft.y, 
                                 glyph.getChar(), glyph.getForeground(), glyph.getBackground());
                }
            }
        }
    }

   getColouredGlyph(map, visibleCells, x, y, z) {
        let glyph = map.getTile(x, y, z);
        let foreground = Color.fromString('#211');
        let visibility = visibleCells[x + ',' + y];
        if (visibility) {
            let items = game.getItemsAt(x, y, z);
            if (items.length > 0) {
                glyph = items.slice(-1)[0];
            }
            if (game.getEntityAt(x, y, z)) {
                glyph = game.getEntityAt(x, y, z);
            }
            let itemColour = Color.fromString(glyph.getForeground());
            foreground = Color.interpolate(foreground, itemColour, visibility);
        }
        return new Glyph({"char": glyph.getChar(), "foreground":Color.toRGB(foreground),"background":glyph.getBackground()});
    }

    renderMessages() {
        let messages = game.getMessages();
        for (let i = 0; i < messages.length; i++) {
            game.updateMessages(messages[i]);
        }
        game.clearMessages();
    }

    renderStats() {
        const hp = this.player.getHitPoints();
        const ac = this.player.getAC();
        const max = this.player.getMaxHitPoints();
        const lvl = this.player.getLevel();
        const gp = 0;
        const hunger = this.player.getHunger().getDescription();
        game.updateStats({hp:hp,max:max,ac:ac, lvl:lvl,gp:gp, hunger:hunger });
    }

    handleInput(inputType, inputData) {
        if (this.subScreen) {
            this.subScreen.handleInput(inputType, inputData);
            return;
        }
        
        let handler = getHandler(inputType, inputData);
        if (handler) {
            handler.func.call(this,inputData);
        }
    }

    move(direction) {
        game.move(direction);
    }

    dig(direction) {
        const pos = this.player.getPos();
        const delta = getMovement(direction);
        game.client.dig({x:pos.x + delta.x, y:pos.y + delta.y, z:pos.z + delta.z });
    }

    gameOver() {
        this.gameEnded = true;
        this.showLoseScreen();
    }

    showTeleportScreen() {
        teleportScreen.setup(this.player);
        this.setSubScreen(teleportScreen);
    }

    showLoseScreen() {
        loseScreen.setup(this.player);
        this.setSubScreen(loseScreen);
    }

    setSubScreen(subScreen) {
        this.subScreen = subScreen;
        game.refresh();
    }

    showItemsSubScreen(subScreen, items, emptyMessage) {
        if (items && subScreen.setup(this.player, items) > 0) {
            this.setSubScreen(subScreen);
        } else {
            game.addMessage(emptyMessage);
        }
    }

    showPickupSubScreen() {
        let items = game.getItemsAt(this.player.getPos().x, this.player.getPos().y, this.player.getPos().z);
        if (items && items.length === 1) {
            let item = items[0];
            game.takeItem(item);
        } else {
            this.showItemsSubScreen(pickupScreen, items, 'There is nothing here to pick up.');
        } 
    }

    showLookScreen() {
        let offsets = this.getScreenOffsets(game.getMap());
        lookScreen.setup(this.player, offsets.x, offsets.y);
        this.setSubScreen(lookScreen);
    }
}

export const playScreen = new PlayScreen();
