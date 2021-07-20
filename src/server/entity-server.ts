import axios from 'axios';
import { Tile } from 'src/common/tile';
import { EVENTS } from '../common/events';
import { Item, Location } from '../common/item';
import { DIRS, getMovement, Movement } from '../common/movement';
import { Cave, CaveItems, CaveTemplate } from './cave';
import { ServerEntity, ServerEntityProperties } from './entities/server-entity';
import { EntityFactory } from './entity-factory';
import { MapBuilder } from './map-builder';
import { Messages, MSGTYPE } from './messages';
import { Messaging } from './messaging';
import * as Tiles from './server-tiles';
import { State } from './state';

interface ConnectResponse {
    id: number;
    url: string;
}

export interface EntityServerTemplate extends CaveTemplate {
    cave_id?: number;
    gateway?: string;
}

export class EntityServer {
    private readonly template: EntityServerTemplate;
    private readonly messaging: Messaging;
    private readonly cave_id: number;
    cave: Cave;
    private readonly repo: EntityFactory;
    entities: State;

    constructor(backend: Messaging, template: EntityServerTemplate) {
        this.template = template;
        this.messaging = backend;
        this.cave_id = template.cave_id || 0;
        this.cave = new Cave(template);
        this.repo = new EntityFactory(this);
        this.entities = new State(this.repo);
        this.connectGateways(template.gateway);
    }

    private async connectGateways(endpoint = 'test_url'): Promise<void> {
        if (endpoint === 'test_url') {
            return this.connectGatewayEndpoints([endpoint]);
        }

        try {
            const result = await axios.get<ConnectResponse[]>(`${endpoint}`, { timeout: 2500 });
            const urls = result.data
                .filter(cave => cave.id !== this.cave_id)
                .map(cave => cave.url);
            this.connectGatewayEndpoints(urls);
        } catch(reason) {
            console.log('failed to get other cave urls from ', endpoint, reason);
        }
    }

    private connectGatewayEndpoints(urls: string[]): void {
        let index = 0;
        if (urls.length > 0) {
            this.cave.getGatewayPositions().forEach(positions => {
                positions.forEach(pos => {
                    const url = urls[index];
                    this.cave.addGateway({pos:pos, url:url})
                    index = (index + 1) % urls.length;
                });
            });
        }
    }

    createEntity(id: string, prototype: ServerEntityProperties & { pos: string | Location }): ServerEntity {
        if (typeof prototype.pos === 'string') {
            prototype.pos = JSON.parse(prototype.pos);
            if (prototype.pos.x == undefined || prototype.pos.y == undefined) {
                prototype.pos = this.cave.getMap().getRandomFloorPosition(prototype.pos.z);
            }
        } else {
            prototype.pos = this.cave.getEntrance();
        }
        return this.entities.addEntity(id, prototype);
    }

    deleteEntity(entity: ServerEntity): void {
        if (this.entities.getEntity(entity.id)) {
            entity.getInventory().forEach(item => this.dropItem(entity, item.getName()));
            if (!entity.isAlive() && entity.corpse) {
                this.dropItem(entity, entity.corpse);
            }
            this.messaging.sendToAll(EVENTS.delete, entity.getPos());
            this.messaging.sendToAll(EVENTS.message, Messages.LEFT_DUNGEON(entity.describeA()));
            this.entities.removeEntity(entity);
        }
    }

    getEntities(): ServerEntity[] {
        return this.entities.getEntities();
    }

    getItemsForRoom(pos: Location): CaveItems {
        return this.cave.getItems(this.getRoom(pos));
    }

    getRoom(pos: Location): number {
        return this.cave.getRegion(pos);
    }

    sendMessage(entity: ServerEntity, type: MSGTYPE, ...message: string[]): void {
        this.messaging.sendMessageToEntity(entity, EVENTS.message, message);
        if (type === MSGTYPE.UPD) {
            const cmd = (entity.isAlive()) ? EVENTS.update : EVENTS.dead;
            this.messaging.sendMessageToEntity(entity, cmd, entity.serialize());
            if (cmd === EVENTS.dead) {
                this.deleteEntity(entity);
            }
        }
    }

    takeItem(entity: ServerEntity, itemName: string): void {
        const { x, y, z } = entity.getPos();
        const items = this.cave.getItemsAt(x, y, z);
        const item = items.find(o => o.getName() === itemName);
        if (item && entity.tryTake(item)) {
            const room = this.cave.getRegion(entity.getPos());
            this.cave.removeItem(item);
            this.messaging.sendToRoom(room, EVENTS.items, this.cave.getItems(room));
        } else {
            entity.messenger(entity, MSGTYPE.INF, Messages.CANT_TAKE());
        }
    }

    dropItem(entity: ServerEntity, itemName: string | Item): void {
        const item = (itemName instanceof Item) ? itemName : entity.dropItem(itemName);
        if (item) {
            const room = this.cave.getRegion(entity.getPos());
            this.cave.addItem(entity.getPos(), item);
            this.messaging.sendToRoom(room, EVENTS.items, this.cave.getItems(room));
        }
    }

    moveEntity(entity: ServerEntity, direction: DIRS): Location | undefined {
        const delta = getMovement(direction);
        const position = (entity.isAlive()) ? this.tryMove(entity, delta) : undefined;
        if (position) {
            entity.setPos(position);
            this.messaging.sendToAll(EVENTS.position, entity.getEntityLocation());
        }
        return position;
    }

    tryMove(entity: ServerEntity, delta: Movement): Location | undefined {
        const x = entity.getPos().x + delta.x;
        const y = entity.getPos().y + delta.y;
        const z = entity.getPos().z + delta.z;
        const newPos: Location = { x, y, z };
        const tile = this.cave.getMap().getTile(x, y, entity.getPos().z);

        const target = this.entities.getEntityAt(newPos);
        if (target) {
            entity.handleCollision(target);
            return;
        }
        
        if (tile.isWalkable()) {
            if (tile.isGateway()) {
                this.passGateway(entity, newPos);
                return;
            }
            if (z !== entity.getPos().z) {
                return this.levelChange(entity, newPos, tile);
            }

            const items = this.cave.getItemsAt(x, y, z);
            if (items.length > 0) {
                entity.handleCollision(items);
            }
            return newPos;
        }
        this.sendMessage(entity, MSGTYPE.INF, Messages.NO_WALK());
        return;
    }

    passGateway(entity: ServerEntity, pos: Location): void {
        const gw = this.cave.getGateway(pos);
        if (gw) {
            this.sendMessage(entity, MSGTYPE.UPD, Messages.TELEPORT());
            this.messaging.sendMessageToEntity(entity, EVENTS.reconnect, {url:gw.url});
            this.deleteEntity(entity);
        }
    }

    levelChange(entity: ServerEntity, newPos: Location, tile: Tile): Location | undefined {
        if (newPos.z < entity.getPos().z && tile === Tiles.stairsUpTile) {
            this.sendMessage(entity, MSGTYPE.INF, Messages.ASCEND(newPos.z));
            return newPos;
        }

        if (newPos.z > entity.getPos().z && tile === Tiles.stairsDownTile) {
            this.sendMessage(entity, MSGTYPE.INF, Messages.DESCEND(newPos.z));
            return newPos;
        } 
        
        this.sendMessage(entity, MSGTYPE.INF, Messages.NO_CLIMB());
        return;
    }

    getMap(entity?: ServerEntity): MapBuilder {
        const map = this.cave.getMap();
        if (entity) {
            map.entrance = entity.entrance;
        }
        return map;
    }

    reset(properties: EntityServerTemplate): void {
        this.messaging.sendMessageToAll(Messages.TELEPORT());
        this.messaging.sendToAll(EVENTS.reset, properties);
        this.cave = new Cave(this.template);
        this.entities = new State(this.repo);
    }
}
