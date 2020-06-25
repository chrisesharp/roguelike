"use strict";

// import Apple from './items/apple.js';
// import Rock from './items/rock.js';
// import Dagger from './items/dagger.js';
// import Chainmail from './items/chainmail.js';
import { Items } from './items/index.js';

const constructors = [];
// constructors.push({type : "dagger", ctor : Dagger});
// constructors.push({type : "rock", ctor : Rock});
// constructors.push({type : "apple", ctor : Apple});
// constructors.push({type : "chainmail", ctor : Chainmail});
Object.keys(Items).forEach(key => {
    let ctor = Items[key];
    let type = ctor.toString().split(' ')[1];
    type = type.charAt(0).toLowerCase() + type.substring(1);
    constructors.push({type:type, ctor:ctor})
});

export default class ItemRepository {
    constructor(types) {
        this.items = this.assignFrequencies(types);
        // this.messenger = null;
    }

    assignFrequencies(types) {
        let items = []
        Object.keys(types).forEach(type => {
            let item = constructors.find(o => (o.type === type));
            if (item) {
                for (let i = 0; i < types[type]; i++) {
                    items.push(item.type);
                }
            }
        });
        return items;
    }

    // setMessenger(messengerFunc) {
    //     this.messenger = messengerFunc;
    // }

    moreItems() {
        return (this.items.length > 0);
    }

    create(prototype) {
        let type = prototype.type;
        prototype.messenger = this.messenger;
        let item = constructors.find(o => (o.type === type));
        return new item.ctor(prototype);
    }

    createRandom() {
        let number = Math.floor(Math.random() * this.items.length);
        let item = this.items.splice(number, 1)[0];
        return this.create({type:item});
    }

}