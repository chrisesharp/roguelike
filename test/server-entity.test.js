"use strict";

import ServerEntity from '../src/server/entities/server-entity.js';
import Rock from '../src/server/items/rock.js';
import Chainmail from '../src/server/items/chainmail.js';

const mockServer = (obj, type, msg) => { };

describe('server entity behaviour', () => {
    it('should not attack if unarmed', (done) => {
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

    it('should deal damage if armed', (done) => {
        const pos1 = {"x":1,"y":2,"z":0};
        const pos2 = {"x":2,"y":2,"z":0};
        let defender = new ServerEntity({pos:pos1, messenger:mockServer, hp:3});
        let attacker = new ServerEntity({pos:pos2, messenger:mockServer, random:(()=>{return 1;})});
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

    it('should have better armour class if wearning armour', (done) => {
        const pos1 = {"x":1,"y":2,"z":0};
        let defender = new ServerEntity({pos:pos1, messenger:mockServer, hp:2});
        expect(defender.getAC()).toBe(10);
        let armour = new Chainmail();
        defender.setAC(armour);
        expect(defender.getAC()).toBe(7);
        done();
    });

    it('should miss if roll low', (done) => {
        const pos1 = {"x":1,"y":2,"z":0};
        const pos2 = {"x":2,"y":2,"z":0};
        let defender = new ServerEntity({pos:pos1, messenger:mockServer, hp:3});
        let attacker = new ServerEntity({pos:pos2, messenger:mockServer, random:(()=>{return 0;})});
        let rock = new Rock();
        attacker.currentWeapon = rock;
        attacker.handleCollision(defender);
        expect(attacker.getHitPoints()).toBe(attacker.getMaxHitPoints());
        expect(defender.getHitPoints()).toBe(defender.getMaxHitPoints());
        done();
    });

    it('should be unarmoured if drop armour', (done) => {
        const pos1 = {"x":1,"y":2,"z":0};
        let defender = new ServerEntity({pos:pos1, messenger:mockServer, hp:2});
        let armour = new Chainmail();
        defender.inventory.push(armour);
        defender.setAC(armour);
        expect(defender.getAC()).toBe(7);
        defender.dropItem(armour.name);
        defender.setAC(null);
        expect(defender.getAC()).toBe(10);
        done();
    });

    it('should be unarmed if drop weapon', (done) => {
        const pos1 = {"x":1,"y":2,"z":0};
        let defender = new ServerEntity({pos:pos1, messenger:mockServer, hp:2});
        let rock = new Rock();
        defender.inventory.push(rock);
        defender.currentWeapon = rock;
        expect(defender.isWielding()).toEqual(rock);
        defender.dropItem(rock.name);
        expect(defender.isWielding()).toEqual(null);
        done();
    });

    it('should be hungry with exertion', (done) => {
        const pos1 = {"x":1,"y":2,"z":0};
        let entity = new ServerEntity({pos:pos1, messenger:mockServer, random:(()=>{return 0;})});
        expect(entity.getHunger().description).toBe("not hungry");
        entity.exertion(20);
        expect(entity.getHunger().description).toBe("hungry");
        entity.exertion(20);
        expect(entity.getHunger().description).toBe("starving");
        done();
      });
});