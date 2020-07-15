"use strict";
import { DIRS, opposite, getMovement } from "../src/common/movement";

describe('move opposite', () => {
    it('should be east opposite to west', (done) => {
        expect(opposite(DIRS.WEST)).toBe(DIRS.EAST);
        done();
    });
    it('should be west opposite to east', (done) => {
        expect(opposite(DIRS.EAST)).toBe(DIRS.WEST);
        done();
    });
    it('should be south opposite to north', (done) => {
        expect(opposite(DIRS.NORTH)).toBe(DIRS.SOUTH);
        done();
    });
    it('should be north opposite to south', (done) => {
        expect(opposite(DIRS.SOUTH)).toBe(DIRS.NORTH);
        done();
    });
    it('should be down opposite to up', (done) => {
        expect(opposite(DIRS.UP)).toBe(DIRS.DOWN);
        done();
    });
    it('should be up opposite to down', (done) => {
        expect(opposite(DIRS.DOWN)).toBe(DIRS.UP);
        done();
    });

    it('should go nowhere for undefined direction', (done) => {
        expect(getMovement()).toEqual({x:0, y:0, z:0});
        done();
    });
});