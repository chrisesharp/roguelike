import { Entity } from '../dist/common/entity';
import { Location } from '../dist/common/movement';
import { Messenger } from '../dist/server/entities/server-entity';
import { Warrior } from '../dist/server/entities/warrior';
import { Rock } from '../dist/server/items/rock';

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
            const hunger = entity.getHunger();
            expect(hunger.getValue()).toBe(0);
            expect(hunger.getDescription()).toBe("not hungry");
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
