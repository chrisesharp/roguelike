"use strict";

import Participant from '../common/participant.js';
import Map from '../common/map.js';
import GoblinBrain from './goblin-brain.js';

export default class GoblinBot {
    constructor(URL, brain) {
        this.serverAddr = URL;
        this.map = null;
        this.messages = [];
        this.client = new Participant(this.serverAddr, this);
        this.brain = brain || new GoblinBrain();
    }

    run(startPos = {x:0, y:0, z:0}) {
        this.start(startPos);
    }

    start(startPos, callback) {
        if (callback) {
            this.brain.ready = callback;
        }
        let props =  {
            name: 'Gobldigook',
            role: 'goblin',
            type: 'monster',
            pos: JSON.stringify(startPos)
          };
        this.client.connectToServer(props)
    }

    ready(event) {
        this.brain.ready(event);
    }

    stop() {
        this.client.disconnectFromServer();
    }
 
    mapAvailable(data) {
        this.map = new Map(data);
    }

    refresh(event) {
        this.ready(event);
    }

    addMessage(messages) {
        if (messages instanceof Array) {
            messages.forEach((message) => {
                this.messages.push(message);
            });
        } else {
            this.messages.push(messages);
        }
        
    }

    move(direction) {
        this.client.move(direction);
    }
}