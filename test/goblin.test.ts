import { Goblin } from '../src/server/entities/goblin';
import { Messenger } from '../src/server/entities/server-entity';

const mockServer: Messenger = () => {
  // Nothing
};

describe('goblin creation', () => {
    it('should be green', () => {
      const goblin = new Goblin({messenger: mockServer});
      expect(goblin.getForeground()).toBe('green');
      expect(goblin.getChar()).toBe('&');
    });

    it('should have 2 hit points', () => {
      const goblin = new Goblin({messenger: mockServer});
      expect(goblin.getHitPoints()).toBe(2);
    });

    it('should always be wielding', () => {
      const goblin = new Goblin({messenger: mockServer});
      expect(goblin.isWielding()).toBe(true);
    });

    it('should be level 1', () => {
      const goblin = new Goblin({messenger: mockServer});
      expect(goblin.getLevel()).toBe(1);
    });
});