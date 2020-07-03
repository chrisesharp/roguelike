"use strict";

export default class Brain {
    constructor(map, client, messages) {
        this.map = map;
        this.client = client;
        this.messages = messages;
        this.currentTarget = null;
    }

    ready(event) {
        
    }

    getCurrentTarget() {
        return this.currentTarget;
    }
}