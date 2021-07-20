"use strict";

import { Messenger, ServerEntity } from '../src/server/entities/server-entity';
import { Rock } from '../src/server/items/rock';
import { Chainmail } from '../src/server/items/chainmail';

const mockServer: Messenger = () => {
    // Nothing
};

describe('server entity behaviour', () => {
    it('should not attack if unarmed', () => {
        const pos1 = {"x":1,"y":2,"z":0};
        const pos2 = {"x":2,"y":2,"z":0};
        const defender = new ServerEntity({pos:pos1, messenger:mockServer, hp:2});
        const attacker = new ServerEntity({pos:pos2, messenger:mockServer});
        attacker.handleCollision(defender);
        expect(attacker.getHitPoints()).toBe(attacker.getMaxHitPoints());
        expect(defender.getHitPoints()).toBe(2);
        attacker.handleCollision(defender);
        expect(attacker.getHitPoints()).toBe(attacker.getMaxHitPoints());
        expect(defender.isAlive()).toBe(true);
    });

    it('should deal damage if armed', () => {
        const pos1 = {"x":1,"y":2,"z":0};
        const pos2 = {"x":2,"y":2,"z":0};
        const defender = new ServerEntity({pos:pos1, messenger:mockServer, hp:3});
        const attacker = new ServerEntity({pos:pos2, messenger:mockServer, random:(()=>{return 1;})});
        const rock = new Rock();
        attacker.tryTake(rock);
        attacker.wield(rock.getName());
        expect(attacker.isWielding()).toBe(true);
        expect(attacker.dealDamage()).toBe(3);
        expect(defender.isWielding()).toBe(false);
        expect(defender.dealDamage()).toBe(1);
        attacker.handleCollision(defender);
        expect(attacker.getHitPoints()).toBe(attacker.getMaxHitPoints());
        expect(defender.getHitPoints()).toBe(0);
        attacker.handleCollision(defender);
        expect(attacker.getHitPoints()).toBe(attacker.getMaxHitPoints());
        expect(defender.isAlive()).toBe(false);
    });

    it('should have better armour class if wearning armour', () => {
        const pos1 = {"x":1,"y":2,"z":0};
        const defender = new ServerEntity({pos:pos1, messenger:mockServer, hp:2});
        expect(defender.getAC()).toBe(10);
        const armour = new Chainmail();
        defender.tryTake(armour);
        defender.wear(armour.getName());
        expect(defender.getAC()).toBe(7);
    });

    it('should miss if roll low', () => {
        const pos1 = {"x":1,"y":2,"z":0};
        const pos2 = {"x":2,"y":2,"z":0};
        const defender = new ServerEntity({pos:pos1, messenger:mockServer, hp:3});
        const attacker = new ServerEntity({pos:pos2, messenger:mockServer, random:(()=>{return 0;})});
        const rock = new Rock();
        attacker.tryTake(rock);
        attacker.wield(rock.getName());
        attacker.handleCollision(defender);
        expect(attacker.getHitPoints()).toBe(attacker.getMaxHitPoints());
        expect(defender.getHitPoints()).toBe(defender.getMaxHitPoints());
    });

    it('should be unarmoured if drop armour', () => {
        const pos1 = {"x":1,"y":2,"z":0};
        const defender = new ServerEntity({pos:pos1, messenger:mockServer, hp:2});
        const armour = new Chainmail();
        defender.tryTake(armour);
        defender.wear(armour.getName());
        expect(defender.getAC()).toBe(7);
        defender.dropItem(armour.getName());
        expect(defender.getAC()).toBe(10);
    });

    it('should be unarmed if drop weapon', () => {
        const pos1 = {"x":1,"y":2,"z":0};
        const defender = new ServerEntity({pos:pos1, messenger:mockServer, hp:2});
        const rock = new Rock();
        defender.tryTake(rock);
        defender.wield(rock.getName());
        expect(defender.isWielding()).toBe(true);
        defender.dropItem(rock.getName());
        expect(defender.isWielding()).toBe(false);
    });

    it('should be hungry with exertion', () => {
        const pos1 = {"x":1,"y":2,"z":0};
        const entity = new ServerEntity({pos:pos1, messenger:mockServer, random:(()=>{return 0;})});
        expect(entity.getHunger().getDescription()).toBe("not hungry");
        entity.exertion(20);
        expect(entity.getHunger().getDescription()).toBe("hungry");
        entity.exertion(20);
        expect(entity.getHunger().getDescription()).toBe("starving");
      });
});