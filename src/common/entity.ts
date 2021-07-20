import { Item, ItemState } from './item';
import { Hunger } from './hunger';

interface EntitySpecificState {
    id: string;
    alive: boolean;
    role: string;
    type?: string;
    level: number;
    speed: number;
    hp: number;
    hunger: number;
    currentArmour?: ItemState; // Could be an explicit interface with wearable: true?
    currentWeapon?: ItemState; // Could be an explicit interface with wieldable: true?
}

export interface EntityState extends EntitySpecificState, ItemState { }

export type EntityProperties = Partial<EntityState>

export class Entity extends Item {
    readonly id: string;
    protected role: string;
    type?: string;
    protected level: number;
    speed: number;
    protected maxHitPoints: number;
    hitPoints: number;
    private hungerLevel: number;
    private sight = 10;
    protected currentArmour?: Item;
    currentWeapon?: Item;
    readonly inventory: Item[] = [];

    constructor(properties: Partial<EntityState> = {}) {
        super(Object.assign({
            name: properties.name || 'anonymous',
            ac: 10
        }, properties));

        this.id = properties.id ?? '';
        this.alive = properties.alive ?? true;
        this.role = properties.role || 'unknown';
        this.type = properties.type;
        this.level = properties.level ?? 0;
        this.speed = properties.speed ?? 1000;
        this.maxHitPoints = properties.hp ?? 1;
        this.hitPoints = this.maxHitPoints;
        this.hungerLevel = properties.hunger ?? 0;
        this.currentArmour = properties.currentArmour ? new Item(properties.currentArmour) : undefined;
        this.currentWeapon = properties.currentWeapon ? new Item(properties.currentWeapon) : undefined;

        if (this.getChar() === ' ') { 
            this.setGlyph({ char: '?' });
        }
    }

    getDescription(): string {
        return this.role;
    }

    getSightRadius(): number {
        return this.sight;
    }

    getHitPoints(): number {
        return this.hitPoints;
    }

    getMaxHitPoints(): number {
        return this.maxHitPoints;
    }

    getLevel(): number {
        return this.level;
    }

    getHunger(): Hunger {
        return new Hunger(this.hungerLevel);
    }

    setHungerValue(value: number): void {
        this.hungerLevel = value;
    }

    isAlive(): boolean {
        if (this.hitPoints <=0) {
            this.kill();
        }
        return this.alive;
    }

    getInventory(): Item[] {
        return this.inventory;
    }

    getArmour(): string {
        return this.currentArmour?.getDescription() || '';
    }

    getWeapon(): string {
        return this.currentWeapon?.getDescription() || '';
    }

    kill(): void {
        this.alive = false;
    }

    // assume(extraProperties?: EntityProperties): void {
    //     Object.assign(this, extraProperties);
    // }

    serialize(): EntityState {
        const state: EntitySpecificState = {
            alive: this.alive,
            currentArmour: this.currentArmour?.serialize(),
            currentWeapon: this.currentWeapon?.serialize(),
            hp: this.hitPoints,
            hunger: this.hungerLevel,
            id: this.id,
            level: this.level,
            role: this.role,
            speed: this.speed,
            type: this.type,
        };
        return Object.assign({}, super.serialize(), state);
    }
}