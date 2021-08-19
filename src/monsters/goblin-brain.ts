import _ from "underscore";
import { Brain } from './brain';
import { DIRS, getMovement, opposite, left, right } from "../common/movement";
import { Location } from "../common/movement";
import { EVENTS } from "../common/events";
import { EntityClient } from "../client/entity-client";
import { Entity } from "../common/entity";
import { GameMap } from "../common/map";
import { Logger } from '../common/logger';

const log = new Logger();

function distance(pos1:Location, pos2:Location) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

export class GoblinBrain extends Brain {
    protected syncCount = 0;
    protected speed = 3;
    private goblin: Entity;
    private nextMove: DIRS | undefined;

    constructor(map: GameMap|undefined, client: EntityClient, messages: string | string[]) {
        super(map, client, messages);
        this.goblin = this.client.getEntity();
        this.speed = 3;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ready(event: string, data?: unknown): void {
        log.debug(`GoblinBrain.ready()| ${event}`,data);
        switch(event) {
            case EVENTS.dead:
                this.client.disconnectFromServer();
                break;
            case EVENTS.delete:
                this.client.sync();
                break;
            case EVENTS.ping:
                if (this.currentTarget && this.isSameLevel(this.currentTarget)) {
                    const directions = this.findDirections(this.currentTarget);
                    this.nextMove = this.chooseDirection(directions);
                    this.client.move(this.nextMove);
                } else {
                    this.syncCount++;
                }
                break;
            case EVENTS.entities:
                this.currentTarget = this.findTarget();
                break;
        }

        if (this.syncCount > 10) {
            this.syncCount = 0;
            this.client.sync();
        }
    }

    findTarget(): Entity | undefined {
        let target;
        let closest = this.goblin.getSightRadius();
        this.client.getOtherEntities().forEach( entity => {
            if (entity.role === this.goblin.role) {
                return;
            }
            const dist = distance(this.goblin.getPos(), entity.getPos());
            if (dist <= closest) {
                closest = dist;
                target = entity;
            }
        });
        return target;
    }

    findDirections(target: Entity): DIRS[] {
        const directions = [];
        if (this.goblin.getPos().x < target.getPos().x) {
            directions.push(DIRS.EAST);
        } else if (this.goblin.getPos().x > target.getPos().x) {
            directions.push(DIRS.WEST);
        } 
        if (this.goblin.getPos().y < target.getPos().y) {
            directions.push(DIRS.SOUTH);
        } else if (this.goblin.getPos().y > target.getPos().y) {
            directions.push(DIRS.NORTH);
        }
        return directions;
    }

    chooseDirection(directions: DIRS[]): DIRS {
        const options: DIRS[] = [];
        const alternatives: DIRS[] = [];
        directions.forEach(dir => {
            const pos = this.nextPos(dir);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const tile = this.map.getTile(pos.x, pos.y, pos.z);
            if (tile.isWalkable() || _.isEqual(pos, this.currentTarget?.getPos())) {
                options.push(dir);
            } else {
                const leftOption = left(dir);
                const rightOption = right(dir)
                if (leftOption) alternatives.push(leftOption);
                if (rightOption) alternatives.push(rightOption);
            }
        });
        if (!options.length) {
            alternatives.forEach(dir => {
                const pos = this.nextPos(dir);
                const tile = this.map.getTile(pos.x, pos.y, pos.z);
                if (tile.isWalkable()) {
                    options.push(dir);
                }
            });
        }
        if (!options.length) {
            directions.forEach(dir => {
                const pos = this.nextPos(opposite(dir));
                const tile = this.map.getTile(pos.x, pos.y, pos.z);
                if (tile.isWalkable()) {
                    options.push(opposite(dir));
                }
            });
        }
        return this.randomOption(options);
    }

    nextPos(dir: DIRS): Location {
        const delta = getMovement(dir);
        const x = this.goblin.getPos().x + delta.x;
        const y = this.goblin.getPos().y + delta.y;
        const z = this.goblin.getPos().z + delta.z;
        return {x:x, y:y, z:z};
    }

    isSameLevel(entity: Entity): boolean {
        return (entity.getPos().z === this.goblin.getPos().z);
    }

    randomOption(options: DIRS[]): DIRS {
        return options[Math.floor(Math.random() * options.length)];
    }
}