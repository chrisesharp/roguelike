"use strict";

import Warrior from '../src/server/entities/warrior';
const mockServer = {
  sendMessage: () => {},
};

describe('warriors creation', () => {
    it('should be yellow', (done) => {
      let warrior = new Warrior({server:mockServer});
      expect(warrior.getGlyph().getForeground()).toBe('yellow');
      expect(warrior.getGlyph().getChar()).toBe('@');
      done();
    });

    it('should have 10 hit points', (done) => {
      let warrior = new Warrior({server:mockServer});
      expect(warrior.getHitPoints()).toBe(10);
      done();
    });

    it('should have a positive to-hit bonus', (done) => {
      let warrior = new Warrior({server:mockServer});
      expect(warrior.toHitBonus()>0).toBe(true);
      done();
    });

    it('should have no inventory', (done) => {
      let warrior = new Warrior({server:mockServer});
      expect(warrior.getInventory()).toEqual([]);
      done();
    });
});