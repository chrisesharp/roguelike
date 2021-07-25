import { Messenger } from '../src/server/entities/server-entity';
import { Wizard } from '../src/server/entities/wizard';

describe('wizards creation', () => {
    const messenger: Messenger = () => {
        // Nothing
    };

    it('should be blue', () => {
        const wizard = new Wizard({ messenger });
        expect(wizard.getForeground()).toBe('blue');
        expect(wizard.getChar()).toBe('@');
    });

    it('should have 4 hit points', () => {
        const warrior = new Wizard({ messenger });
        expect(warrior.getHitPoints()).toBe(4);
    });

    it('should not have a positive to-hit bonus', () => {
        const warrior = new Wizard({ messenger });
        expect(warrior.toHitBonus()).toBeLessThanOrEqual(0);
    });
});
