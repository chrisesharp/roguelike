"use strict";

import Screen from './screen.js';
import { isReturnKey } from '../keys.js';
import { game } from '../game.js';

export default class LoginScreen extends Screen {
    constructor(template) {
        super(template);
        this.ended = false;
        this.message = "Enter your name below";
    }

    exit() {
        if (!this.ended) {
            game.connectToServer();
            this.ended = true;
        }
    }
    
    render(display) {
        let opts = display.getOptions();
        let centreX = Math.floor(opts.width/2)
        let centreY = Math.floor(opts.height/2)
        let banner = "#";
        let enter = "Press [Enter] to start";
        let width = Math.max(game.title.length,enter.length) + 2;
        display.drawText(centreX - Math.floor(width/2),centreY - 1, this.generateBanner(banner, width));
        display.drawText(centreX - Math.floor(width/2), centreY, this.generateTitle(game.title, banner, width));
        display.drawText(centreX - Math.floor(width/2),centreY + 1, this.generateBanner(banner, width));
        display.drawText(centreX - Math.floor(this.message.length/2),centreY + 2, this.message);
        display.drawText(centreX - Math.floor(enter.length/2),centreY + 3, enter);
    }

    generateBanner(banner, width) {
        let output = "%c{red}";
        for (let i=0; i < width;i++) {
            output += banner;
        }
        return output;
    }

    generateTitle(title, banner, width) {
        let gap = width - title.length;
        return "%c{red}" + this.generateBanner(banner, Math.floor(gap/2)) + "%c{yellow}"+ title + "%c{red}" + this.generateBanner(banner, Math.floor(gap/2)) ;
    }
    
    handleInput(inputType, inputData) {
        let name = game.getNameField();
        if (inputType === 'keydown' && isReturnKey(inputData)) {
            if (name.value) {
                this.exit();
            } else {
                this.message = "You need a name...";
                game.refresh();
            }
        }
    }
}

export const loginScreen = new LoginScreen();