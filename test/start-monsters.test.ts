import { startServer, stopServer } from '../dist/start-server';
import { startMonsters, stopMonsters, MonsterRoster, StartMonsterOpts } from '../dist/start-monsters';

beforeAll(() => {
    startServer({});
});

afterAll(() => {
    stopServer();
});

describe('monster bots', () => {
    it('should start right number and type', () => {
        const orcs:MonsterRoster = {type:"orc", frequency:2};
        const opts:StartMonsterOpts = {monsters:[orcs],test:true};
        return startMonsters(opts).then(started => {
            expect(started.length).toBe(1);
            expect(started[0].length).toBe(2);
            expect(started[0][0].role).toEqual('orc');
            stopMonsters(started);
        });
    });
});
