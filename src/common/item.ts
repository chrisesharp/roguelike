import { Glyph, GlyphState } from './glyph';
import { Location } from './movement';

export type ItemProperties = Partial<ItemState>

interface ItemSpecificState {
    pos: Location;
    name: string;
    details: string;
    edible: boolean;
    wieldable: boolean;
    wearable: boolean;
    damage: number;
    ac: number;
}

export interface ItemState extends ItemSpecificState, GlyphState { }

const vowels = Array.from('aeiou');

function startsWithVowel(text: string): boolean {
    const firstLetter = text.charAt(0).toLowerCase();
    return vowels.includes(firstLetter);
}

export class Item extends Glyph { // Should an item have a glyph rather than be one?
    #state: ItemSpecificState;
    protected alive = false;
    protected walkable = true;

    constructor(properties: Partial<ItemState> = {}) {
        super(properties);
        this.#state = {
            pos: properties.pos || { x: 0, y: 0, z: 0 },
            name: properties.name || "thing",
            details: properties.details || "none",
            edible: properties.edible ?? false,
            wieldable: properties.wieldable ?? false,
            wearable: properties.wearable ?? false,
            damage: properties.damage || 0,
            ac: properties.ac || 0,
        };
    }

    getName(): string {
        return this.#state.name;
    }

    getDescription(): string {
        return this.#state.name;
    }

    describeA(capitalize = false): string {
        const description = this.getDescription();
        let prefix = startsWithVowel(description) ? 'An' : 'A';
        if (!capitalize) {
            prefix = prefix.toLowerCase();
        }
        return `${prefix} ${description}`;
    }

    describeThe(capitalize = false): string {
        const prefix = capitalize ? 'The' : 'the';
        return `${prefix} ${this.getDescription()}`;
    }

    getDetails(): string {
        return this.#state.details;
    }

    isEdible(): boolean {
        return this.#state.edible;
    }

    isWieldable(): boolean {
        return this.#state.wieldable;
    }

    isWearable(): boolean {
        return this.#state.wearable;
    }

    setGlyph(properties: Partial<GlyphState>): void {
        super.updateState(properties);
    }

    // assume(extraProperties?: Partial<ItemState>): void {
    //     Object.assign(this, extraProperties);
    // }

    getDamage(): number {
        return this.#state.damage;
    }

    getAC(): number {
        return this.#state.ac;
    }

    getPos(): Location {
        return Object.assign({}, this.#state.pos);
    }

    setPos(location: Location): void {
        this.#state.pos = location;
    }

    serialize(): ItemState {
        return Object.assign({}, super.serialize(), this.#state);
    }

    updateState(state: Partial<ItemState>): void {
        super.updateState(state);
        // TODO understand why this doesn't work!
        // for(const [k,v] of Object.entries(this.#state)) {
        //     this.#state[k] = state[k] ?? v;
        // }
        this.#state = {
            pos: state.pos ?? this.#state.pos,
            name: state.name ?? this.#state.name,
            details: state.details ?? this.#state.details,
            edible: state.edible ?? this.#state.edible,
            wieldable: state.wieldable ?? this.#state.wieldable,
            wearable: state.wearable ?? this.#state.wearable,
            damage: state.damage ?? this.#state.damage,
            ac: state.ac ?? this.#state.ac,
        };
    }

    protected setAC(ac: number): void {
        this.#state.ac = ac;
    }
}
