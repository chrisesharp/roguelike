import { Entity } from 'src/common/entity';
import { ServerEntity } from './entities/server-entity';

export interface RulesProperties {
    random?: () => number;
}

export class Rules {
    private readonly random: () => number;

    constructor(properties: RulesProperties = {}) {
        this.random = properties.random || (() => Math.random());
    }

    toHitRoll(attacker: ServerEntity, defender: Entity): boolean {
        const roll = Math.floor(this.random() * 20);
        const target = 20 - defender.getAC();
        const bonus = attacker.toHitBonus();
        return roll + bonus >= target;
    }
}

