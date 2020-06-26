"use strict";

import _ from "underscore";

export default class State {
    constructor(factory) {
        this.factory = factory;
        this.connections = {};
    }

    addEntity(id, prototype, pos) {
        prototype.pos = pos;
        let entity = this.factory.create(prototype);
        entity.entrance = pos;
        this.connections[id] = entity;
        return entity;
    }

    getEntities() {
        return this.connections;
    }

    getEntity(id) {
        return this.connections[id];
    }

    getEntityAt(pos) {
        for (let socket_id in this.connections) {
            let entity = this.connections[socket_id];
            if (_.isEqual(entity.pos, pos)) {
                return entity;
            }
        }
    }

    removeEntity(id) {
        delete this.connections[id];
    }
}