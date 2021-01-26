"use strict";

import Wizard from '../src/server/entities/wizard';
const mockServer = {
  sendMessage: () => {},
};

describe('wizards creation', () => {
    it('should be blue', (done) => {
      let wizard = new Wizard({server:mockServer});
      expect(wizard.getForeground()).toBe('blue');
      expect(wizard.getChar()).toBe('@');
      done();
    });

    it('should have 4 hit points', (done) => {
      let warrior = new Wizard({server:mockServer});
      expect(warrior.getHitPoints()).toBe(4);
      done();
    });

    it('should not have a positive to-hit bonus', (done) => {
      let warrior = new Wizard({server:mockServer});
      expect(warrior.toHitBonus()<=0).toBe(true);
      done();
    });
});