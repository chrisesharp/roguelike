"use strict";

import Bot from './bot.js';
import GoblinBrain from './goblin-brain.js';
import Goblin from '../server/entities/goblin.js';

export default class GoblinBot extends Bot {
    static numberOccuring = 3;
    static name = 'Goblin';
    static role = 'goblin';

    constructor(URL, brain) {
        super(URL, brain);
        this.brain = brain || new GoblinBrain(null, this.client, this.messages);
        this.role = GoblinBot.role;
    }

    start(startPos, callback) {
        let props =  {
            name: GoblinBot.name,
            role: this.role
          };
        this.startPos =  (startPos) ? startPos : {z:Goblin.level - 1};
        props.pos = JSON.stringify(this.startPos)
        super.start(props, callback);
        return this;
    }
}