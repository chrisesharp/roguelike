"use strict";

import Cave from "./cave.js";
import { Tiles } from "./server-tiles.js";
import { getMovement } from "../common/movement.js";
import EntityFactory from "./entity-factory.js";
import Item from '../common/item.js';
import { MSGTYPE, Messages } from "./messages.js";
import { EVENTS } from "../common/events.js";
import State from "./state.js";
import axios from 'axios';

export default class EntityServer {
    constructor(backend, template) {
        this.template = template;
        this.messaging = backend;
        this.cave_id = template.cave_id || 0;
        this.cave = new Cave(template);
        this.repo = new EntityFactory(this);
        this.entities = new State(this.repo);
        this.connectGateways(template.gateways);
    }

    connectGateways(endpoint) {
        const server = this;
        if (endpoint && endpoint != "test_url") {
            axios.get(`${endpoint}`,{
                timeout: 2500
            }).then( (result) => {
                let urls = [];
                result.data.forEach( (cave) => {
                    if (cave.id !== this.cave_id) {
                        urls.push(cave.url);
                    }
                });
                server.connectGatewayEndpoints(urls);
            }).catch( (reason) => {
                console.log("failed to get other cave urls from ", endpoint, reason);
            });
        } else {
            server.connectGatewayEndpoints(endpoint);
        }
    }

    connectGatewayEndpoints(urls) {
        urls = urls || [];
        let index = 0;
        if (urls.length > 0) {
            let gatesByLevel = this.cave.getGatewayPositions();
            Object.keys(gatesByLevel).forEach((key) => {
                gatesByLevel[key].forEach((pos) => {
                    let url = urls[index];
                    this.cave.addGateway({pos:pos, url:url})
                    index = (index + 1) % urls.length;
                });
            });
        }
    }

    createEntity(id, prototype) {
        if (prototype.pos) {
            prototype.pos = JSON.parse(prototype.pos);
            if (prototype.pos.x == undefined || prototype.pos.y == undefined)  {
                prototype.pos = this.cave.map.getRandomFloorPosition(prototype.pos.z);
            }
        } else {
            prototype.pos = this.cave.getEntrance();
        }
        return this.entities.addEntity(id, prototype);
    }

    deleteEntity(entity) {
        if (this.entities.getEntity(entity.id)) {
            let gear = entity.getInventory();
            gear.forEach((item) => {
                this.dropItem(entity, item.name);
            });
            if (!entity.isAlive()) { this.dropItem(entity, entity.corpse); }
            this.messaging.sendToAll(EVENTS.delete, entity.pos);
            this.messaging.sendToAll(EVENTS.message, Messages.LEFT_DUNGEON(entity.describeA()));
            this.entities.removeEntity(entity);
        }
    }

    getEntities() {
        return this.entities.getEntities();
    }

    getItemsForRoom(pos) {
        return this.cave.getItems(this.getRoom(pos));
    }

    getRoom(pos) {
        return this.cave.getRegion(pos);
    }

    sendMessage(entity, ...message) {
        let type = message.shift();
        this.messaging.sendMessageToEntity(entity, EVENTS.message, message);
        if (type === MSGTYPE.UPD) {
            let cmd = (entity.isAlive()) ? EVENTS.update : EVENTS.dead;
            this.messaging.sendMessageToEntity(entity, cmd, entity);
            if (cmd === EVENTS.dead) {
                this.deleteEntity(entity);
            }
        }
    }

    takeItem(entity, itemName) {
        let items = this.cave.getItemsAt(entity.pos);
        let item = items.find(o => (o.name === itemName));
        if (item && entity.tryTake(item)) {
            let room = this.cave.getRegion(entity.pos);
            this.cave.removeItem(item);
            this.messaging.sendToRoom(room, EVENTS.items, this.cave.getItems(room));
        } else {
            entity.messenger(entity, MSGTYPE.INF, Messages.CANT_TAKE(itemName));
        }
    }

    dropItem(entity, itemName) {
        let item = (itemName instanceof Item) ? itemName : entity.dropItem(itemName);
        if (item) {
            let room = this.cave.getRegion(entity.pos);
            this.cave.addItem(entity.pos, item);
            this.messaging.sendToRoom(room, EVENTS.items, this.cave.getItems(room));
        }
    }

    moveEntity(entity, direction) {
        let delta = getMovement(direction);
        let position = (entity.isAlive()) ? this.tryMove(entity, delta) : null;
        if (position) {
            entity.pos = position;
            this.messaging.sendToAll(EVENTS.position, entity.getPos());
        }
        return position;
    }

    tryMove(entity, delta) {
        let x = entity.pos.x + delta.x;
        let y = entity.pos.y + delta.y;
        let z = entity.pos.z + delta.z;
        let newPos = {x:x, y:y, z:z};
        let tile = this.cave.getMap().getTile(x, y, entity.pos.z);

        let target = this.entities.getEntityAt(newPos);
        if (target) {
            entity.handleCollision(target);
            return null;
        }
        
        if (tile.isWalkable()) {
            if (tile.isGateway()) {
                return this.passGateway(entity, newPos);
            }
            if (z !== entity.pos.z) {
                return this.levelChange(entity, newPos, tile);
            }

            let items = this.cave.getItemsAt(newPos);
            if (items.length > 0) {
                entity.handleCollision(items);
            }
            return newPos;
        }
        this.sendMessage(entity, MSGTYPE.INF, Messages.NO_WALK(entity));
        return null;
    }

    passGateway(entity, pos) {
        let gw = this.cave.getGateway(pos);
        if (gw) {
            this.sendMessage(entity, MSGTYPE.UPD, Messages.TELEPORT());
            this.messaging.sendMessageToEntity(entity, EVENTS.reconnect, {url:gw.url});
            this.deleteEntity(entity);
        }
    }

    levelChange(entity, newPos, tile) {
        if (newPos.z < entity.pos.z && tile === Tiles.stairsUpTile) {
            this.sendMessage(entity, MSGTYPE.INF, Messages.ASCEND([newPos.z]));
            return newPos;
        }

        if (newPos.z > entity.pos.z && tile === Tiles.stairsDownTile) {
            this.sendMessage(entity, MSGTYPE.INF, Messages.DESCEND([newPos.z]));
            return newPos;
        } 
        
        this.sendMessage(entity, MSGTYPE.INF, Messages.NO_CLIMB(entity));
        return null;
    }

    getMap(entity) {
        let map = this.cave.getMap();
        map.entrance = entity.entrance;
        return map;
    }

    reset(properties) {
        this.messaging.sendMessageToAll(Messages.TELEPORT());
        this.messaging.sendToAll(EVENTS.reset, properties);
        this.cave = new Cave(this.template);
        this.entities = new State(this.repo);
    }
}