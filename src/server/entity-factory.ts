import { ServerEntity, ServerEntityProperties, Messenger } from './entities/server-entity';
import { Players, Monsters } from './entities/index';
import { EntityServer } from './entity-server';

const entityTypes = Object.assign({}, Players, Monsters);
const defaultType = (properties: ServerEntityProperties) => new ServerEntity(properties);

export class EntityFactory {
    private readonly messenger: Messenger;

    constructor(server: EntityServer) {
        this.messenger = (entity, type, message) => {
            server.sendMessage(entity, type, message);
        };
    }

    create(prototype: Partial<ServerEntityProperties>): ServerEntity {
        const newEntity = (prototype.role && entityTypes[prototype.role]) || defaultType;
        const properties = Object.assign({}, prototype, { messenger: this.messenger });
        return newEntity(properties);
    }
}
