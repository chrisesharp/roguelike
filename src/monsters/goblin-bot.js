"use strict";

import Participant from '../common/participant.js';
import Map from '../common/map.js';

export default class GoblinBot {
    constructor(URL) {
        this.serverAddr = URL;
        this.map = null;
        this.messages = [];
        this.participant = new Participant(this.serverAddr, this);
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
        this.participant.connectToServer(props)
    }

    stop() {
        this.participant.disconnectFromServer();
    }
 
    mapAvailable(data) {
        this.map = new Map(data);
        this.ready(this.map);
    }

    refresh(event) {
        this.ready(event);
    }

    addMessage(messages) {
        messages.forEach((message) => {
            this.messages.push(message);
        });
    }

    move(direction) {
        this.participant.move(direction);
    }
}