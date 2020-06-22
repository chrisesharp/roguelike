"use strict";

import { Color } from '../display.js';

export default class LoseScreen  {
    enter() {
        console.log("Entered lose screen."); 
    }

    exit() {
        console.log("Exited lose screen."); 
    }

    render(display) {
        let opts = display.getOptions();
        let centreX = Math.floor(opts.width/2)
        let height = opts.height;
        let delta = Math.floor(255/height);
        let message = "You lose!"
        let x = (centreX-message.length/2);
        for (let y = 0; y < height; y++) {
            let r = 255 - (y*delta);
            let g = 0;
            let b = 0;
            let background = Color.toRGB([r, g, b]);
            display.drawText(x, y, "%b{" + background + "}" + message);
        }
    }

    handleInput(inputType, inputData) {
        // Nothing to do here      
    }
};