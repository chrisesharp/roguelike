export class Hunger {
    value: number;

    constructor(value: number) {
        this.value = value;
    }

    getValue(): number {
        return this.value;
    }

    getDescription(): string {
        if (this.value < 1) {
            return "not hungry";
        }
        if (this.value < 2) {
            return "hungry";
        }
        return "starving";
    }
}
