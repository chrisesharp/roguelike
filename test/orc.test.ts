import { Orc } from '../src/server/entities/orc';
import { Messenger } from '../src/server/entities/server-entity';

describe('orc creation', () => {
    const messenger: Messenger = () => {
        // Nothing
    };

    it('should be red', () => {
        // let orc = new Orc({server:mockServer});
        const orc = new Orc({ messenger });
        expect(orc.getForeground()).toBe('red');
        expect(orc.getChar()).toBe('&');
    });

    it('should have 3 hit points', () => {
        const orc = new Orc({ messenger });
        expect(orc.getHitPoints()).toBe(3);
    });

    it('should always be wielding', () => {
        const orc = new Orc({ messenger });
        expect(orc.isWielding()).toBe(true);
    });

    it('should be level 2', () => {
        const orc = new Orc({ messenger });
        expect(orc.getLevel()).toBe(2);
    });
});
