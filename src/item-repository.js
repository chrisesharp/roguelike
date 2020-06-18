"use strict";

import ServerEntity from './entities/server-entity.js';
import Rock from './items/rock.js';
import Dagger from './items/dagger.js';
import Item from './items/item.js';

const constructors = [];
constructors.push({type : "dagger", ctor : Dagger});
constructors.push({type : "rock", ctor : Rock});

export default class ItemRepository {
    constructor(types={}) {
        this.probabilities = [];
        this.assignProbabilities(types);
        // this.messenger = null;
    }

    assignProbabilities(probs) {
        Object.keys(probs).forEach(type => {
            let item = constructors.find(o => (o.type === type));
            if (item) {
                for (let i = 0; i < probs[type]; i++) {
                    this.probabilities.push(item.type);
                }
            }
        });
    }

    // setMessenger(messengerFunc) {
    //     this.messenger = messengerFunc;
    // }

    create(prototype) {
        let type = prototype.type;
        prototype.messenger = this.messenger;
        let item = constructors.find(o => (o.type === type));
        return new item.ctor(prototype);
    }

    createRandom() {
        let number = Math.floor(Math.random() * this.probabilities.length);
        let item = this.probabilities[number];
        return this.create({type:item});
    }

}