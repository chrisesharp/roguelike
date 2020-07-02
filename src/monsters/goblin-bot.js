"use strict";

import Participant from '../common/participant.js';
import Map from '../common/map.js';

export default class GoblinBot {
    constructor(URL) {
        this.serverAddr = URL;
        this.map = null;
        this.messages = [];
        this.client = new Participant(this.serverAddr, this);
        this.ready = () => {};
    }

    start(startPos, callback) {
        if (callback) {
            this.ready = callback;
        }
        let props =  {
            name: 'Gobldigook',
            role: 'goblin',
            type: 'monster',
            pos: JSON.stringify(startPos)
          };
        this.client.connectToServer(props)
    }

    stop() {
        this.client.disconnectFromServer();
    }
 
    mapAvailable(data) {
        this.map = new Map(data);
        this.ready(this.map);
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