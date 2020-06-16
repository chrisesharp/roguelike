"use strict";

import Wizard from '../src/entities/wizard';
const mockServer = {
  sendMessage: () => {},
};

describe('wizards creation', () => {
    test('should be blue', (done) => {
      let wizard = new Wizard({server:mockServer});
      expect(wizard.getGlyph().getForeground()).toBe('blue');
      expect(wizard.getGlyph().getChar()).toBe('@');
      done();
    });

    test('should have 4 hit points', (done) => {
      let warrior = new Wizard({server:mockServer});
      expect(warrior.getHitPoints()).toBe(4);
      done();
    });
});