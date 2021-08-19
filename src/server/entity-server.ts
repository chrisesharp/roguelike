import axios from 'axios';
import { MapState } from '../common/map';
import { Tile } from '../common/tile';
import { EVENTS } from '../common/events';
import { Item, ItemState } from '../common/item';
import { DIRS, Location, getMovement } from '../common/movement';
import { Cave, CaveItems, CaveTemplate } from './cave';
import { ServerEntity, ServerEntityProperties } from './entities/server-entity';
import { EntityFactory } from './entity-factory';
import { Messages, MSGTYPE } from './messages';
import { Messaging } from './messaging';
import * as Tiles from './server-tiles';
import { State } from './state';
import { ConnectionProps } from "../common/connection-props";
import {Mutex, MutexInterface} from 'async-mutex';
import { Logger } from '../common/logger';
const log = new Logger();

interface ConnectResponse {
    id: number;
    url: string;
}

export interface EntityServerTemplate extends CaveTemplate {
    cave_id?: number;
    gateways?: string;
}

export function serializeCaveItems(itemsByLocation: CaveItems): { [pos: string]: ItemState[] } {
    const entries = Object.entries(itemsByLocation)
            .map(([location, items]) => [location, items.map(item => item.serialize())]);
    return Object.fromEntries(entries);
}

export class EntityServer {
    private readonly template: EntityServerTemplate;
    private readonly messaging: Messaging;
    private readonly cave_id: number;
    private mutex: MutexInterface = new Mutex();
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
        this.connectGateways(template.gateways);
    }

    private async connectGateways(endpoint = 'test_url'): Promise<void> {
        if (endpoint === 'test_url') {
            return this.connectGatewayEndpoints([endpoint]);
        }

        endpoint =  (process.env.PRODUCTION) ? `${endpoint}${process.env.DOMAIN}/caves` : "http://localhost:3000/caves";

        try {
            const result = await axios.get<ConnectResponse[]>(`${endpoint}`, { timeout: 2500 });
            const urls = result.data
                .filter(cave => cave.id !== this.cave_id)
                .map(cave => cave.url);
            this.connectGatewayEndpoints(urls);
        } catch(reason) {
            log.error('failed to get other cave urls from ', endpoint, reason);
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
        log.debug(`EntityServer.createEntity()| ${id}`, prototype);
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
        log.debug(`EntityServer.deleteEntity()| ${entity.id}`, entity);
        if (this.entities.getEntity(entity.id)) {
            const items:(Item|string)[] = entity.getInventory().map(i => i.getName());
            if (!entity.isAlive()) {
                const corpse = entity.dropCorpse();
                if (corpse) items.push(corpse);
            }
            items.forEach(item => this.dropItem(entity, item));
            this.messaging.sendToAll(EVENTS.delete, entity.serialize());
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
        log.debug(`EntityServer.sendMessage()| ${type}`,entity, message);
        this.messaging.sendMessageToEntity(entity, EVENTS.message, message);
        if (type === MSGTYPE.UPD) {
            const cmd = (entity.isAlive()) ? EVENTS.update : EVENTS.dead;
            this.messaging.sendMessageToEntity(entity, cmd, entity.serialize());
            if (cmd === EVENTS.dead) {
                this.deleteEntity(entity);
            }
        }
    }

    async takeItem(entity: ServerEntity, itemName: string): Promise<void> {
        log.debug(`EntityServer.takeItem()| ${itemName}`, entity);
        const { x, y, z } = entity.getPos();
        await this.mutex.runExclusive( () => {
            const items = this.cave.getItemsAt(x, y, z);
            const item = items.find(o => o.getName() === itemName);
            if (item && entity.tryTake(item)) {
                const room = this.cave.getRegion(entity.getPos());
                this.cave.removeItem(item);
                const items = this.cave.getItems(room);
                this.messaging.sendToRoom(room, EVENTS.items, serializeCaveItems(items));
            } else {
                entity.messenger(entity, MSGTYPE.INF, Messages.CANT_TAKE());
            }
        });
    }

    async dropItem(entity: ServerEntity, itemName: string | Item): Promise<void> {
        log.debug(`EntityServer.dropItem()| ${itemName}`, entity);
        await this.mutex.runExclusive( () => {
            const item = (itemName instanceof Item) ? itemName : entity.dropItem(itemName);
            if (item) {
                const room = this.cave.getRegion(entity.getPos());
                this.cave.addItem(entity.getPos(), item);
                const items = this.cave.getItems(room);
                this.messaging.sendToRoom(room, EVENTS.items, serializeCaveItems(items));
            }
        });
    }

    digWall(entity: ServerEntity, pos:Location): boolean {
        const tile = this.cave.getMap().getTile(pos.x, pos.y, pos.z);
        if (entity.tryDigging(tile)) {
            this.cave.getMap().addTile(pos.x, pos.y, pos.z, Tiles.floorTile);
            return true;
        }
        this.sendMessage(entity, MSGTYPE.INF, Messages.NO_DIG());
        return false;
    }

    moveEntity(entity: ServerEntity, direction: DIRS): Location | undefined {
        log.debug(`EntityServer.moveEntity()| ${direction}`, entity);
        const delta = getMovement(direction);
        if ((delta.x + delta.y + delta.z) === 0) {
            return;
        }
        const position = (entity.isAlive()) ? this.tryMove(entity, delta) : undefined;
        if (position) {
            entity.setPos(position);
            this.messaging.sendToAll(EVENTS.position, entity.getEntityLocation());
        }
        return position;
    }

    tryMove(entity: ServerEntity, delta: Location): Location | undefined {
        log.debug(`EntityServer.tryMove()| (${delta.x},${delta.y},${delta.z})`, entity);
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

    getMapState(entity?: ServerEntity): MapState {
        const map = this.cave.getMap();
        return {
            depth: map.getDepth(),
            width: map.getWidth(),
            entrance: entity?.entrance || map.entrance || map.getRandomFloorPosition(0),
            height: map.getHeight(),
            tiles: map.getTilesState(),
        };
    }

    reset(properties: ConnectionProps): void {
        this.messaging.sendMessageToAll(Messages.TELEPORT());
        this.messaging.sendToAll(EVENTS.reset, properties);
        this.resetCave();
        this.resetState();
    }

    resetState(): void {
        this.entities = new State(this.repo);
    }

    resetCave(): void {
        this.cave = new Cave(this.template);
    }

    getMessaging(): Messaging {
        return this.messaging;
    }
}
