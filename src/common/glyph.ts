export interface GlyphState {
    char: string;
    foreground: string;
    background: string;
}

export class Glyph { 
    #state: GlyphState;

    constructor(properties: Partial<GlyphState>) {
        this.#state = {
            char: properties.char ?? ' ',
            foreground: properties.foreground ?? 'white',
            background: properties.background ?? 'black',
        };
    }

    getChar(): string { 
        return this.#state.char; 
    }

    getBackground(): string {
        return this.#state.background;
    }

    getForeground(): string { 
     return this.#state.foreground; 
    }

    getRepresentation(): string {
        return '%c{' + this.#state.foreground + '}%b{' + this.#state.background + '}' + this.#state.char +
            '%c{white}%b{black}';
    }

    updateState(state: Partial<GlyphState>): void {
        this.#state = Object.assign(this.#state, state);
    }

    serialize(): GlyphState {
        return Object.assign({}, this.#state);
    }
}
