"use strict";

import ServerEntity from '../src/entities/server-entity.js';
import Rock from '../src/items/rock.js';
const mockServer =  () => {};

describe('entity creation', () => {
    test('should not attack if unarmed', (done) => {
        const pos1 = {"x":1,"y":2,"z":0};
        const pos2 = {"x":2,"y":2,"z":0};
        let defender = new ServerEntity({pos:pos1, messenger:mockServer, hp:2});
        let attacker = new ServerEntity({pos:pos2, messenger:mockServer});
        attacker.handleCollision(defender);
        expect(attacker.getHitPoints()).toBe(attacker.getMaxHitPoints());
        expect(defender.getHitPoints()).toBe(2);
        attacker.handleCollision(defender);
        expect(attacker.getHitPoints()).toBe(attacker.getMaxHitPoints());
        expect(defender.isAlive()).toBe(true);
        done();
    });

    test('should deal damage if armed', (done) => {
        const pos1 = {"x":1,"y":2,"z":0};
        const pos2 = {"x":2,"y":2,"z":0};
        let defender = new ServerEntity({pos:pos1, messenger:mockServer, hp:3});
        let attacker = new ServerEntity({pos:pos2, messenger:mockServer});
        let rock = new Rock();
        attacker.currentWeapon = rock;
        expect(attacker.isWielding()).toEqual(rock);
        expect(attacker.dealDamage()).toBe(3);
        expect(defender.isWielding()).toEqual(null);
        expect(defender.dealDamage()).toBe(1);
        attacker.handleCollision(defender);
        expect(attacker.getHitPoints()).toBe(attacker.getMaxHitPoints());
        expect(defender.getHitPoints()).toBe(0);
        attacker.handleCollision(defender);
        expect(attacker.getHitPoints()).toBe(attacker.getMaxHitPoints());
        expect(defender.isAlive()).toBe(false);
        done();
    });
});