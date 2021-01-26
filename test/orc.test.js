"use strict";

import Orc from '../src/server/entities/orc';
const mockServer = {
  sendMessage: () => {},
};

describe('orc creation', () => {
    it('should be red', (done) => {
      let orc = new Orc({server:mockServer});
      expect(orc.getForeground()).toBe('red');
      expect(orc.getChar()).toBe('&');
      done();
    });

    it('should have 3 hit points', (done) => {
      let orc = new Orc({server:mockServer});
      expect(orc.getHitPoints()).toBe(3);
      done();
    });

    it('should always be wielding', (done) => {
      let orc = new Orc({server:mockServer});
      expect(orc.isWielding()).toBe(true);
      done();
    });

    it('should be level 2', (done) => {
      let orc = new Orc({server:mockServer});
      expect(orc.getLevel()).toBe(2);
      done();
    });
});