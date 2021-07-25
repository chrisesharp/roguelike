import { Entity } from '../src/common/entity';
import { Location } from '../src/common/location';
import { Messenger } from '../src/server/entities/server-entity';
import { Warrior } from '../src/server/entities/warrior';
import { Rock } from '../src/server/items/rock';

const defaultPos: Location = { x: 2, y: 2, z: 0 };
const mockServer: Messenger = () => {
    // Nothing
};

describe('entity', () => {
    describe('creation', () => {
        it('should change glyph properties', () => {
            const entity = new Entity({ pos: defaultPos });
            expect(entity.getForeground()).toBe('white');
            entity.setGlyph({ foreground: 'red' });
            expect(entity.getForeground()).toBe('red');
        });

        it('should have 1 hit point by default', () => {
            const entity = new Entity();
            expect(entity.getHitPoints()).toBe(1);
            expect(entity.getMaxHitPoints()).toBe(1);
        });

        it('should not be hungry by default', () => {
            const entity = new Entity();
            expect(entity.getHunger()).toMatchObject({ value: 0 })
        });

        it('should have 10 feet vision by default', () => {
            const entity = new Entity();
            expect(entity.getSightRadius()).toBe(10);
        });
    });

    describe('serialization', () => {
        const warrior = new Warrior({ messenger: mockServer });
        const rock = new Rock();
        warrior.tryTake(rock);
        warrior.wield(rock.getName());
        
        it('can create new object using serialized state', () => {
            const newWarrior = new Entity(warrior.serialize());
            expect(newWarrior.getHitPoints()).toBe(warrior.getHitPoints());
            expect(newWarrior.getWeapon()).toBe(rock.getDescription());
        });
    });
});
