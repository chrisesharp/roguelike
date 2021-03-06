"use strict";

import EntityClient from '../client/entity-client.js';
import Map from '../common/map.js';
import { EVENTS } from '../common/events.js';

export default class Bot {
    constructor(URL, brain) {
        this.serverAddr = URL;
        this.messages = [];
        this.client = new EntityClient(this.serverAddr, (event, data) => {this.refresh(event, data);});
        this.brain = brain;
        this.startPos = null;
    }

    start(props, callback) {
        props.type = 'monster';
        this.client.connectToServer(props, callback)
        return this;
    }

    ready(event, data) {
        this.brain.ready(event, data);
    }

    stop() {
        this.client.disconnectFromServer(EVENTS.dead);
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