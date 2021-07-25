/* eslint-disable jest/no-conditional-expect */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable jest/no-done-callback */
import axios from 'axios';

import { startServer, stopServer } from '../dist/start-server';

const addr = 'http://0.0.0.0:3000'

// const defaultMap = {
//     width: 4,
//     height: 5,
//     entrance: { x: 0, y: 0, z: 0 },
//     gateways: 'test_url',
// };

beforeAll(() => {
    startServer({test:true});
});

afterAll(() => {
    stopServer();
});

beforeEach(() => {
    // square brackets are used for IPv6
});

afterEach(() => {
    // noop
});


describe('basic REST API', () => {
    it('should be healthy', (done) => {
        const expected = {"status": "UP"};

        axios.get(`${addr}/health`,{
            timeout: 2500
        }).then( (result) => {
            expect(result.data).toStrictEqual(expected);
            done();
        }).catch( (err) => {
            console.log("something went wrong ",err);
            // noop
        });
    });

    it('should return roles', (done) => {
        const expected = [
            { type: 'warrior', name: 'Warrior' },
            { type: 'wizard', name: 'Wizard' }
          ];

        axios.get(`${addr}/roles`,{
            timeout: 2500
        }).then( (result) => {
            expect(result.data).toStrictEqual(expected);
            done();
        }).catch( (err) => {
            console.log("something went wrong ",err);
            // noop
        });
    });

    it('should return caves', (done) => {
        const expected = [
            {
                "id": 0,
                "name": "Starting Cave",
                "url": "http://localhost:3000"
            },
            {
                "id": 1,
                "name": "Kreepy Kavern",
                "url": "http://localhost:3000"
            }
        ];

        axios.get(`${addr}/caves`,{
            timeout: 2500
        }).then( (result) => {
            expect(result.data).toStrictEqual(expected);
            done();
        }).catch( (err) => {
            console.log("something went wrong ",err);
            // noop
        });
    });

    it('should reset', (done) => {
        const expected = {"reset": "OK"};

        axios.get(`${addr}/reset`,{
            timeout: 2500
        }).then( (result) => {
            expect(result.data).toStrictEqual(expected);
            done();
        }).catch( (err) => {
            console.log("something went wrong ",err);
            // noop
        });
    });
});
