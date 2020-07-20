"use strict";

import RogueClient from '../client/rogue-client.js';
import Map from '../common/map.js';
import GoblinBrain from './goblin-brain.js';
import { EVENTS } from '../common/events.js';

export default class GoblinBot {
    constructor(URL, brain) {
        this.serverAddr = URL;
        this.messages = [];
        this.client = new RogueClient(this.serverAddr, (event, data) => {this.refresh(event, data);});
        this.brain = brain || new GoblinBrain(null, this.client, this.messages);
    }

    start(startPos, callback) {
        if (callback) {
            this.brain.ready = callback;
        }
        let props =  {
            name: 'Goblin',
            role: 'goblin',
            type: 'monster'
          };
        if (startPos) {
            props.pos = JSON.stringify(startPos)
        }
        this.client.connectToServer(props)
        return this;
    }

    ready(event, data) {
        this.brain.ready(event, data);
    }

    stop() {
        this.client.disconnectFromServer();
    }
 
    mapAvailable(data) {
        this.brain.setMap(new Map(data));
    }

    refresh(event, data) {
        if (event === EVENTS.message) {
            this.addMessage(data);
        }

        if (event === EVENTS.map) {
            this.mapAvailable(data);
        }
        this.ready(event, data);
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