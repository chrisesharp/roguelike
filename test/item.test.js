"use strict";

import Rock from "../src/server/items/rock";
import Apple from "../src/server/items/apple";
const defaultPos = {"x":2,"y":2,"z":0};

describe('item creation', () => {
    it('should be describable', (done) => {
        let rock = new Rock({pos:defaultPos});
        expect(rock.pos.x).toBe(defaultPos.x);
        expect(rock.describeA(true)).toBe("A rock");
        expect(rock.describeThe(true)).toBe("The rock");
        expect(rock.describeA(false)).toBe("a rock");
        expect(rock.describeThe(false)).toBe("the rock");
        done();
    });

    it('should be describable with proper preposition', (done) => {
        let apple = new Apple({pos:defaultPos});
        expect(apple.pos.x).toBe(defaultPos.x);
        expect(apple.describeA(true)).toBe("An apple");
        expect(apple.describeThe(true)).toBe("The apple");
        expect(apple.describeA(false)).toBe("an apple");
        expect(apple.describeThe(false)).toBe("the apple");
        done();
    });

    it('should be edible if edible', (done) => {
        let apple = new Apple();
        let rock = new Rock();
        expect(apple.isEdible()).toBe(true);
        expect(apple.getDetails()).toBe("it looks edible");
        expect(rock.isEdible()).toBe(false);
        done();
    });
});