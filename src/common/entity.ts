import { Item, ItemState } from './item';
import { Hunger } from './hunger';

interface EntitySpecificState {
    id: string;
    alive: boolean;
    role: string;
    type?: string;
    level: number;
    speed: number;
    sight: number;
    hp: number;
    maxHP: number;
    hunger: number;
    currentArmour: ItemState | undefined; // Could be an explicit interface with wearable: true?
    currentWeapon: ItemState | undefined; // Could be an explicit interface with wieldable: true?
    inventory: ItemState[];
}

export interface EntityState extends EntitySpecificState, ItemState { }

export type EntityProperties = Partial<EntityState>

export class Entity extends Item {
    readonly id: string;
    role: string;
    type?: string;
    protected level: number;
    speed: number;
    sight: number;
    maxHitPoints: number;
    hitPoints: number;
    private hungerLevel: number;
    protected currentArmour?: Item;
    currentWeapon?: Item;
    inventory: Item[] = [];

    constructor(properties: Partial<EntityState> = {}) {
        super(Object.assign({
            name: properties.name || 'anonymous',
            ac: 10
        }, properties));

        this.id = properties.id ?? '';
        this.alive = properties.alive ?? true;
        this.role = properties.role || 'unknown';
        this.type = properties.type;
        this.level = properties.level ?? 1;
        this.speed = properties.speed ?? 1000;
        this.sight = properties.sight ?? 10;
        this.maxHitPoints = properties.maxHP ?? 1;
        this.hitPoints = properties.hp ?? 1;
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

    updateState(state: Partial<EntityState>): void {
        super.updateState(state);
        this.alive = state.alive ?? this.alive;
        this.role = state.role ?? this.role;
        this.type = state.type ?? this.type;
        this.level = state.level ?? this.level;
        this.speed = state.speed ?? this.speed;
        this.sight = state.sight ?? this.sight;
        this.hitPoints = state.hp ?? this.hitPoints;
        this.maxHitPoints = state.maxHP ?? this.maxHitPoints;
        this.hungerLevel = state.hunger ?? this.hungerLevel;
        this.currentArmour = state.currentArmour ? new Item(state.currentArmour) : undefined;
        this.currentWeapon = state.currentWeapon ? new Item(state.currentWeapon) : undefined;
        this.inventory = state.inventory?.map(i => new Item(i)) || [];
    }

    serialize(): EntityState {
        const state: EntitySpecificState = {
            alive: this.alive,
            currentArmour: this.currentArmour?.serialize() ?? undefined,
            currentWeapon: this.currentWeapon?.serialize() ?? undefined,
            hp: this.hitPoints,
            maxHP: this.maxHitPoints,
            hunger: this.hungerLevel,
            id: this.id,
            level: this.level,
            role: this.role,
            speed: this.speed,
            sight: this.sight,
            type: this.type,
            inventory: this.inventory.map(i => i.serialize()),
        };
        return Object.assign({}, super.serialize(), state);
    }
}