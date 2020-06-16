"use strict";

import ServerEntity from '../src/entities/server-entity.js';
const mockServer =  () => {};

describe('entity creation', () => {
    test('should assume properties', (done) => {
        const pos1 = {"x":1,"y":2,"z":0};
        const pos2 = {"x":2,"y":2,"z":0};
        let defender = new ServerEntity({pos:pos1, messenger:mockServer, hp:2});
        let attacker = new ServerEntity({pos:pos2, messenger:mockServer});
        attacker.handleCollision(defender);
        expect(attacker.getHitPoints()).toBe(attacker.getMaxHitPoints());
        expect(defender.getHitPoints()).toBe(1);
        attacker.handleCollision(defender);
        expect(attacker.getHitPoints()).toBe(attacker.getMaxHitPoints());
        expect(defender.isAlive()).toBe(false);
        done();
    });
});