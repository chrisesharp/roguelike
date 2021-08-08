import { BackendServer} from '../dist/backend-server';
import { startMonsters, stopMonsters} from '../dist/start-monsters';
import { StartOpts } from '../dist/server';

let backend:BackendServer;

beforeAll(() => {
    backend = new BackendServer({});
});

afterAll(() => {
    backend.stop();
});

describe('monster bots', () => {
    it('should start right number and type', () => {
        const opts:StartOpts = {test:true};
        return startMonsters(opts).then(started => {
            expect(started.length).toBe(2);
            expect(started[0].length).toBe(5);
            expect(started[0][0].role).toEqual('orc');
            stopMonsters(started);
        });
    });
});
