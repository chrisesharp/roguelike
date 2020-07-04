"use strict";

import Goblin from '../src/server/entities/goblin';
const mockServer = {
  sendMessage: () => {},
};

describe('goblin creation', () => {
    test('should be green', (done) => {
      let goblin = new Goblin({server:mockServer});
      expect(goblin.getGlyph().getForeground()).toBe('green');
      expect(goblin.getGlyph().getChar()).toBe('&');
      done();
    });

    test('should have 2 hit points', (done) => {
      let goblin = new Goblin({server:mockServer});
      expect(goblin.getHitPoints()).toBe(2);
      done();
    });

    test('should always be wielding', (done) => {
      let goblin = new Goblin({server:mockServer});
      expect(goblin.isWielding()).toBe(true);
      done();
    });
});