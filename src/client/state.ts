import { Entity, EntityState } from '../common/entity';
import { Item, ItemState, Location } from '../common/item';
import _ from 'underscore';

export class State {
    private readonly entity = new Entity();
    private readonly entities = new Map<string, Entity>();
    private readonly others = new Map<string, Entity>();
    private readonly items = new Map<string, Item[]>();

    constructor() {
        this.addEntity(this.entity);
    }

    updateEntityPosition(ourId: string, event: { id: string, pos: Location }): boolean {
        //TODO remove the console.logs
        console.log("this entity:",this.entity)
        const entity = (event.id === ourId) ? this.entity : this.others.get(event.id);
        console.log("entity to move:",entity)
        if (!entity) {
            return false;
        }

        this.moveEntity(entity, event.pos);
        return true;
    }

    updateEntities(ourId: string, entities: EntityState[]): void {
        entities.forEach(entity => {
            if (entity.id === ourId) {
                this.updateOurself(entity);
            } else {
                this.updateOthers(entity);
            }
        });
    }

    updateOthers(entity: EntityState): void {
        let npc = this.others.get(entity.id);
        if (npc) {
            npc.assume(entity);
            this.moveEntity(npc, entity.pos);
        } else {
            npc = new Entity(entity);
            this.others.set(npc.id, npc);
            this.addEntity(npc);
        }
    }

    updateOurself(entity: EntityState): void {
        this.removeEntity(this.entity);
        this.entity.assume(entity);
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
        this.removeEntityAt(entity.getPos());
    }

    removeEntityAt(pos: Location): void {
        const key = this.posToKey(pos);
        this.entities.delete(key);
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
