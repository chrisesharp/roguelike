import { Entity, EntityState } from '../common/entity';
import { Item, ItemState } from '../common/item';
import { Location } from "../common/movement";
import _ from 'underscore';
// import {Mutex, MutexInterface} from 'async-mutex';

export class State {
    private entity = new Entity();
    private readonly entities = new Map<string, Entity>();
    private readonly others = new Map<string, Entity>();
    private readonly items = new Map<string, Item[]>();
    // private mutex: MutexInterface = new Mutex();

    constructor() {
        this.addEntity(this.entity);
    }

    getEntity(): Entity {
        return this.entity;
    }

    updateEntityPosition(ourId: string, event: { id: string, pos: Location }): boolean {
        const entity = (event.id === ourId) ? this.entity : this.others.get(event.id);
        if (!entity) {
            return false;
        }

        this.moveEntity(entity, event.pos);
        return true;
    }

    updateEntities(ourId: string, states: EntityState[]): void {
        states.forEach(entity => {
            if (entity.id === ourId) {
                this.updateOurself(entity);
            } else {
                this.updateOthers(entity);
            }
        });
    }

    updateOthers(state: EntityState): void {
        let npc = this.others.get(state.id);
        if (npc) {
            npc.updateState(state);
            this.moveEntity(npc, state.pos);
        } else {
            npc = new Entity(state);
            this.others.set(npc.id, npc);
            this.addEntity(npc);
        }
    }

    updateOurself(state: EntityState): void {
        this.removeEntity(this.entity);
        this.entity.updateState(state);
        this.addEntity(this.entity);
    }

    updateItems(itemsByLocation: { [location: string]: ItemState[] }): void {
        this.items.clear();
        Object.values(itemsByLocation)
            .flat()
            .map(item => new Item(item))
            .forEach(newItem => this.addItem(newItem));
    }

    addItem(item: Item): void {
        const key = this.posToKey(item.getPos());
        const items = this.items.get(key) || [];
        items.push(item);
        this.items.set(key, items);
    }

    key(x: number, y: number, z: number): string {
        return `(${x},${y},${z})`;
    }

    posToKey({x, y, z}: Location): string {
        return this.key(x, y, z);
    }

    addEntity(entity: Entity): void {
        const key = this.posToKey(entity.getPos());
        this.entities.set(key, entity);
    }

    getEntityAt(x: number, y: number, z: number): Entity | undefined {
        const key = this.key(x, y, z);
        return this.entities.get(key);
    }

    removeEntity(entity: Entity): void {
        const key = this.posToKey(entity.getPos());
        if (this.entities.get(key)?.id == entity.id) {
            this.entities.delete(key);
        } 
    }

    moveEntity(entity: Entity, dest: Location): void {
        if (_.isEqual(entity.getPos(), dest)) {
            return;
        }
        this.removeEntity(entity);
        entity.setPos(dest);
        this.addEntity(entity);
    }

    getItemsAt(x: number, y: number, z: number): Item[] {
        const key = this.key(x, y, z);
        return this.items.get(key) || [];
    }

    getOthers(): Entity[] {
        return Array.from(this.others.values());
    }
}
