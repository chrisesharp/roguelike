"use strict";

import Screen from './screen.js';

export default class HelpScreen extends Screen {
    render(display) {
        super.render(display);
        let y = 2;
        display.drawText(0, y++, 'The villagers have been complaining of ');
        display.drawText(0, y++, 'a terrible stench coming from the cave.');
        display.drawText(0, y++, 'Find the source of this smell and get');
        display.drawText(0, y++, 'rid of it!');
        y += 3;
        display.drawText(0, y++, '[,] to pick up items');
        display.drawText(0, y++, '[d] to drop items');
        display.drawText(0, y++, '[i] to see what items you have');
        display.drawText(0, y++, '[e] to eat items');
        display.drawText(0, y++, '[w] to wield items');
        display.drawText(0, y++, '[W] to wear items');
        display.drawText(0, y++, '[x] to examine items');
        display.drawText(0, y++, '[;] to look around you');
        display.drawText(0, y++, '[?] to show this help screen');
        y += 3;
        let text = '--- press any key to continue ---';
        display.drawText(this.width / 2 - text.length / 2, y++, text);
    }
};

export const helpScreen = new HelpScreen({caption: function(){ return 'NodeJS Rogue Help';}});