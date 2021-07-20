import { Entity } from '../src/common/entity';
import { Location } from '../src/common/item';
import { Messenger } from '../src/server/entities/server-entity';
import { Warrior } from '../src/server/entities/warrior';
import { Rock } from '../src/server/items/rock';

const defaultPos: Location = { x: 2, y: 2, z: 0 };
const mockServer: Messenger = () => {
    // Nothing
};

describe('entity', () => {
    describe('creation', () => {
        // it('should assume properties', () => {
        //     const entity = new Entity({ pos: defaultPos });
        //     expect(entity.getPos().x).toBe(defaultPos.x);
        //     expect(entity.getPos().y).toBe(defaultPos.y);
        //     expect(entity.getPos().z).toBe(defaultPos.z);
        //     expect(entity.getChar()).toBe('?');
        //     expect(entity.getForeground()).toBe('white');
        //     expect(entity.getBackground()).toBe('black');
        //     expect(entity.getDescription()).toBe('unknown');
        //     expect(entity.getName()).toBe('anonymous');
        //     expect(entity.isAlive()).toBe(true);
        //     entity.assume({ pos: { x: 1, y: 1, z: 1 } });
        //     entity.assume();
        //     entity.assume({ speed: 500 });
        //     entity.assume({ alive: false });
        //     expect(entity.isAlive()).toBe(false);
        //     expect(entity.getPos().x).toBe(1);
        //     expect(entity.getPos().y).toBe(1);
        //     expect(entity.getPos().z).toBe(1);
        //     expect(entity.speed).toBe(500);
        // });

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
