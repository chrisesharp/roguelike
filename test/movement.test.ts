import { DIRS, opposite, left, right, getMovement } from "../dist/common/movement";

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

    it('should be west to left of north', () => {
        expect(left(DIRS.NORTH)).toBe(DIRS.WEST);
    });

    it('should be east to right of north', () => {
        expect(right(DIRS.NORTH)).toBe(DIRS.EAST);
    });

    it('should go nowhere for undefined direction', () => {
        expect(getMovement()).toEqual({x:0, y:0, z:0});
    });
});