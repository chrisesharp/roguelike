"use strict";

import ServerEntity from './entities/server-entity.js';
import Warrior from './entities/warrior.js';
import Wizard from './entities/wizard.js';

const constructors = [];
constructors.push({role : "warrior", ctor : Warrior});
constructors.push({role : "wizard", ctor : Wizard});
constructors.push({role : "default", ctor : ServerEntity});

export default class EntityRepository {
    constructor() {
        this.messenger = null;
    }

    setMessenger(messengerFunc) {
        this.messenger = messengerFunc;
    }

    create(prototype) {
        let name = prototype.name;
        let role = prototype.role;
        let type = prototype.type;
        prototype.messenger = this.messenger;
        let entity = constructors.find(o => (o.role === role || o.role === "default"));
        return new entity.ctor(prototype);
    }

}