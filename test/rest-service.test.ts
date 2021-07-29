/* eslint-disable jest/no-conditional-expect */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable jest/no-done-callback */
import axios from 'axios';
import { start } from '../dist/start';
import { Server } from '../dist/server';

let addr: string;
let server:Server;

beforeAll(async () => {
    server = await start("BACKEND", "3001") as Server;
    addr = "http://0.0.0.0:3001";
    console.log("Addr:",addr);
});

afterAll(() => {
    server.stop();
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

        axios.put(`${addr}/reset`,{
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
