import { Location, Item } from "../src/common/item";
import { Apple } from "../src/server/items/apple";
import { Rock } from "../src/server/items/rock";

const defaultPos: Location = { x: 2, y: 2, z: 0 };

describe('item', () => {
    describe('creation', () => {
        it('should be describable', () => {
            const rock = new Rock({pos:defaultPos});
            expect(rock.getPos().x).toBe(defaultPos.x);
            expect(rock.describeA(true)).toBe("A rock");
            expect(rock.describeThe(true)).toBe("The rock");
            expect(rock.describeA(false)).toBe("a rock");
            expect(rock.describeThe(false)).toBe("the rock");
        });
    
        it('should be describable with proper preposition', () => {
            const apple = new Apple({pos:defaultPos});
            expect(apple.getPos().x).toBe(defaultPos.x);
            expect(apple.describeA(true)).toBe("An apple");
            expect(apple.describeThe(true)).toBe("The apple");
            expect(apple.describeA(false)).toBe("an apple");
            expect(apple.describeThe(false)).toBe("the apple");
        });
    
        it('should be edible if edible', () => {
            const apple = new Apple();
            const rock = new Rock();
            expect(apple.isEdible()).toBe(true);
            expect(apple.getDetails()).toBe("it looks edible");
            expect(rock.isEdible()).toBe(false);
        });
    });

    describe('serialization', () => {
        const apple = new Apple();
        const rock = new Rock();
        it('should serialize', () => {
            const newApple = new Item(apple.serialize());
            const newRock = new Item(rock.serialize());
            expect(newApple.isEdible()).toBe(true);
            expect(newRock.isEdible()).toBe(false);
            expect(newRock.getName()).toBe("rock");
        });
    });
});
