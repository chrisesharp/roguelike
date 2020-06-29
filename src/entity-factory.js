"use strict";

import ServerEntity from './entities/server-entity.js';
import { Entities } from './entities/index.js';
const constructors = [];

Object.keys(Entities).forEach(key => {
    let ctor = Entities[key];
    let role = ctor.toString().split(' ')[1];
    role = role.charAt(0).toLowerCase() + role.substring(1);
    constructors.push({role:role, ctor:ctor})
});
constructors.push({role : "default", ctor : ServerEntity});


export default class EntityFactory {
    constructor() {
        this.messenger = null;
    }

    setMessengerForEntities(server) {
        this.messenger = (entity, type, message) => {
            server.sendMessage(entity, type, message);
        };
    }

    create(prototype) {
        let role = prototype.role;
        prototype.messenger = this.messenger;
        let entity = constructors.find(o => (o.role === role || o.role === "default"));
        return new entity.ctor(prototype);
    }

}