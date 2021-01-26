"use strict";

import Goblin from '../src/server/entities/goblin';
const mockServer = {
  sendMessage: () => {},
};

describe('goblin creation', () => {
    it('should be green', (done) => {
      let goblin = new Goblin({server:mockServer});
      expect(goblin.getForeground()).toBe('green');
      expect(goblin.getChar()).toBe('&');
      done();
    });

    it('should have 2 hit points', (done) => {
      let goblin = new Goblin({server:mockServer});
      expect(goblin.getHitPoints()).toBe(2);
      done();
    });

    it('should always be wielding', (done) => {
      let goblin = new Goblin({server:mockServer});
      expect(goblin.isWielding()).toBe(true);
      done();
    });

    it('should be level 1', (done) => {
      let goblin = new Goblin({server:mockServer});
      expect(goblin.getLevel()).toBe(1);
      done();
    });
});