import { Location } from "src/common/item";
import _ from "underscore";
import { ServerEntity, ServerEntityProperties } from "./entities/server-entity";
import { EntityFactory } from "./entity-factory";

export class State {
    private readonly factory: EntityFactory;
    private readonly connections: { [key: string]: ServerEntity } = {};

    constructor(factory: EntityFactory) {
        this.factory = factory;
    }

    addEntity(id: string, prototype: Partial<ServerEntityProperties>): ServerEntity {
        prototype.id = id;
        const entity = this.factory.create(prototype);
        entity.entrance = prototype.pos;
        this.connections[id] = entity;
        return entity;
    }

    getEntities(): ServerEntity[] {
        return Object.values(this.connections);
    }

    getEntity(id: string): ServerEntity | undefined {
        return this.connections[id];
    }

    getEntityAt(pos: Location): ServerEntity | undefined {
        return this.getEntities().find(entity => _.isEqual(entity.getPos(), pos));
    }

    removeEntityByID(id: string): void {
        delete this.connections[id];
    }

    removeEntity(entity: ServerEntity): void {
        this.removeEntityByID(entity.id);
    }
}
