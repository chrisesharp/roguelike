import { Messenger } from '../src/server/entities/server-entity';
import { Warrior } from '../src/server/entities/warrior';

describe('warriors creation', () => {
    const messenger: Messenger = () => {
        // Nothing
    };

    it('should be yellow', () => {
        const warrior = new Warrior({ messenger });
        expect(warrior.getForeground()).toBe('yellow');
        expect(warrior.getChar()).toBe('@');
    });

    it('should have 10 hit points', () => {
        const warrior = new Warrior({ messenger });
        expect(warrior.getHitPoints()).toBe(10);
    });

    it('should have a positive to-hit bonus', () => {
        const warrior = new Warrior({ messenger });
        expect(warrior.toHitBonus()).toBeGreaterThan(0);
    });

    it('should have no inventory', () => {
        const warrior = new Warrior({ messenger });
        expect(warrior.getInventory()).toHaveLength(0);
    });
});