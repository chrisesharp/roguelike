"use strict";

import Entity from '../src/common/entity.js';
const defaultPos = {"x":2,"y":2,"z":0};

describe('entity creation', () => {
    it('should assume properties', (done) => {
      let entity = new Entity({pos:defaultPos});
      expect(entity.pos.x).toBe(defaultPos.x);
      expect(entity.pos.y).toBe(defaultPos.y);
      expect(entity.pos.z).toBe(defaultPos.z);
      expect(entity.getChar()).toBe('?');
      expect(entity.getForeground()).toBe('white');
      expect(entity.getBackground()).toBe('black');
      expect(entity.getDescription()).toBe('unknown');
      expect(entity.getName()).toBe('anonymous');
      expect(entity.isAlive()).toBe(true);
      entity.assume({pos:{x:1,y:1,z:1}});
      entity.assume();
      entity.assume({speed:500});
      entity.assume({alive:false});
      expect(entity.isAlive()).toBe(false);
      expect(entity.pos.x).toBe(1);
      expect(entity.pos.y).toBe(1);
      expect(entity.pos.z).toBe(1);
      expect(entity.speed).toBe(500);
      done();
    });

    it('should change glyph properties', (done) => {
      let entity = new Entity({pos:defaultPos});
      expect(entity.getForeground()).toBe('white');
      entity.setGlyph({foreground:'red'});
      expect(entity.getForeground()).toBe('red');
      done();
    });

    it('should have 1 hit point by default', (done) => {
      let entity = new Entity();
      expect(entity.getHitPoints()).toBe(1);
      expect(entity.getMaxHitPoints()).toBe(1);
      done();
    });

    it('should not be hungry by default', (done) => {
      let entity = new Entity();
      expect(entity.getHunger()).toBe("not hungry");
      done();
    });

    it('should have 10 feet vision by default', (done) => {
      let entity = new Entity();
      expect(entity.getSightRadius()).toBe(10);
      done();
    });
});