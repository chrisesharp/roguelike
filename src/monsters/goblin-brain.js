"use strict";

import Brain from './brain.js';

export default class GoblinBrain extends Brain {
    ready(event) {
        if (event === 'entities') {
            this.currentTarget = this.findTarget();
        }
    }

    findTarget() {
        let target;
        Object.keys(this.client.others).forEach(key => {
            target = this.client.others[key];
        });
        return target;
    }
}