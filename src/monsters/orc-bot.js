"use strict";

import Bot from './bot.js';
import GoblinBrain from './goblin-brain.js';
import Orc from '../server/entities/orc.js';

export default class OrcBot extends Bot {
    static numberOccuring = 3;
    static name = 'Orc';
    static role = 'orc';

    constructor(URL, brain) {
        super(URL, brain);
        this.brain = brain || new GoblinBrain(null, this.client, this.messages);
        this.role = OrcBot.role;
    }

    start(startPos, callback) {
        let props =  {
            name: OrcBot.name,
            role: this.role
          };
        startPos =  (startPos) ? startPos : {z:Orc.level - 1};
        props.pos = JSON.stringify(startPos)
        return super.start(props, callback);
    }
}