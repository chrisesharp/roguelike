import { DIRS, opposite, getMovement } from "../src/common/movement";

describe('move opposite', () => {
    it('should be east opposite to west', () => {
        expect(opposite(DIRS.WEST)).toBe(DIRS.EAST);
    });
    it('should be west opposite to east', () => {
        expect(opposite(DIRS.EAST)).toBe(DIRS.WEST);
    });
    it('should be south opposite to north', () => {
        expect(opposite(DIRS.NORTH)).toBe(DIRS.SOUTH);
    });
    it('should be north opposite to south', () => {
        expect(opposite(DIRS.SOUTH)).toBe(DIRS.NORTH);
    });
    it('should be down opposite to up', () => {
        expect(opposite(DIRS.UP)).toBe(DIRS.DOWN);
    });
    it('should be up opposite to down', () => {
        expect(opposite(DIRS.DOWN)).toBe(DIRS.UP);
    });

    it('should go nowhere for undefined direction', () => {
        expect(getMovement()).toEqual({x:0, y:0, z:0});
    });
});