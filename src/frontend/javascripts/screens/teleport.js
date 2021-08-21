"use strict";

import Screen from './screen.js';
import { game } from '../game.js';
import { Color } from '../display.js';

export class TeleportScreen extends Screen {
    setup(player) {
        this.player = player;
    }

    render(display) {
        game.getScreen().renderTiles.call(game.getScreen(), display);
        let opts = display.getOptions();
        let centreX = Math.floor(opts.width/2)
        let height = opts.height;
        let delta = Math.floor(255/height);
        let message = "Teleporting!"
        let x = (centreX - message.length/2);
        for (let y = 0; y < height; y++) {
            let r = 255 - (y * delta);
            let g = 0;
            let b = 0;
            let background = Color.toRGB([r, g, b]);
            display.drawText(x, y, "%b{" + background + "}" + message);
        }
    }

    handleInput(inputType, inputData) {
        // do nothing until we land
    }
};

export const teleportScreen = new TeleportScreen();