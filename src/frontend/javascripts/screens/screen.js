"use strict";

import { game } from '../game.js';

export default class Screen {
    constructor(template) {
        template = template || {};
        this.okFunction = template['ok'] || function(x) {return x;};
        this.captionFunction = template['caption'];
        this.gameEnded = false;
    }

    setup() {
    }

    enter() {
    }

    exit() {
    }

    gameOver() {
        this.gameEnded = true;
    }

    render(display) {
        let opts = display.getOptions();
        this.width = opts.width;
        this.height = opts.height;
        let text = this.captionFunction();
        let offset = Math.floor(this.width / 2 - text.length / 2);
        display.drawText(offset, 0, text);
        for (let i=offset; i < offset + text.length; i++) {
            display.drawText(i, 1, '=');
        }
    }

    executeOkFunction() {
        game.getScreen().setSubScreen(null);
    }

    handleInput(inputType, inputData) {
        game.getScreen().setSubScreen(null);
    }

}