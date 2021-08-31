import * as http from 'http';
import { AddressInfo } from 'net';
import { io, Socket } from 'socket.io-client';
import { ConnectionServer } from '../dist/server/connection-server';
import { DIRS } from '../dist/common/movement';
import { EntityState } from '../dist/common/entity';
import { EVENTS } from '../dist/common/events';
import { MapState } from '../dist/common/map';
import { Apple } from '../dist/server/items/apple';
import { Dagger } from '../dist/server/items/dagger';
import { ItemState } from '../dist/common/item';

let spectator: Socket;
let playerOne: Socket;
let playerTwo: Socket;
let httpServer: http.Server;
let httpServerAddr: AddressInfo;
let app: ConnectionServer;
let pollForExpectedEventsOnConnect: NodeJS.Timeout;

const defaultMap = {
    depth: 1,
    width: 100,
    height: 100,
    entrance: { x: 0, y: 0, z: 0 },
    gateways: 'test_url',
};

const apple = new Apple();
const dagger = new Dagger();

const PLAYER_ONE_NAME = 'playerOne';
const PLAYER_TWO_NAME = 'playerTwo';

beforeEach((done) => {
    httpServer = http.createServer();
    httpServerAddr = httpServer.listen().address() as AddressInfo;
    app = new ConnectionServer(httpServer, defaultMap);

    spectator = io(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
        transports: ['websocket'],
        auth: {
            name: 'spectator',
            role: 'spectator'
        }
    });

    let entitiesReceived = false;
    let itemsReceived = false;

    spectator.on(EVENTS.entities, () => {
        entitiesReceived = true;
    });

    spectator.on(EVENTS.items, () => {
        itemsReceived = true;
    });

    pollForExpectedEventsOnConnect = setInterval(() => {
        if (entitiesReceived && itemsReceived) {
            clearInterval(pollForExpectedEventsOnConnect);
            done();
        }
    }, 50);
});

function addPlayerOne() {
    playerOne = io(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
        transports: ['websocket'],
        auth: {
            name: PLAYER_ONE_NAME,
            role: 'testcode'
        }
    });
}

function addPlayerTwo() {
    playerTwo = io(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
        transports: ['websocket'],
        auth: {
            name: PLAYER_TWO_NAME,
            role: 'testcode'
        }
    });
}

afterEach((done) => {
    clearInterval(pollForExpectedEventsOnConnect);
    if (spectator.connected) {
        spectator.disconnect();
    }
    if (playerOne && playerOne.connected) {
        playerOne.disconnect();
    }
    if (playerTwo && playerTwo.connected) {
        playerTwo.disconnect();
    }
    app.stop();
    httpServer.close();
    done();
});

describe('spectators can watch games', () => {

    it('should get pings', (done) => {
        spectator.on(EVENTS.ping, () => {
            done();
        });
    });

    it('should be able to get the map', (done) => {
        spectator.on(EVENTS.map, (map: MapState) => {
            expect(map.depth).toBe(defaultMap.depth);
            expect(map.width).toBe(defaultMap.width);
            expect(map.height).toBe(defaultMap.height);
            expect(map.tiles.length).toBe(defaultMap.depth);
            expect(map.tiles[0].length).toBe(defaultMap.height);
            expect(map.tiles[0][0].length).toBe(defaultMap.width);
            done();
        });

        spectator.emit(EVENTS.getMap);
    });

    it('should get notified when an entity moves', (done) => {
        spectator.on(EVENTS.entities, (entities: EntityState[]) => {
            entities.forEach(entity => {
                if (entity.name === PLAYER_ONE_NAME) {
                    playerOne.emit(EVENTS.move, DIRS.SOUTH);
                }
            });
        });

        spectator.on(EVENTS.position, (payload: EntityState) => {
            expect(payload.id).toBe(playerOne.id);
            expect(payload.pos.x).toBe(0);
            expect(payload.pos.y).toBe(1);
            expect(payload.pos.z).toBe(0);
            done();
        });

        addPlayerOne();
    });

    it('should get notified that an item is no longer on the map when it is taken', (done) => {
        app.entityServer.cave.addItem({ x: 0, y: 0, z: 0 }, apple);

        spectator.on(EVENTS.items, (items: { [location: string]: ItemState[] }) => {
            expect(items).toEqual({});
            done();
        });

        addPlayerOne();

        playerOne.on('connect', () => {
            playerOne.emit(EVENTS.take, apple.getName());
        });
    });

    it('should get notified that an entity has an item when one is taken', (done) => {
        app.entityServer.cave.addItem({ x: 0, y: 0, z: 0 }, apple);

        spectator.on(EVENTS.entities, (entities: EntityState[]) => {
            entities.forEach(entity => {
                if (entity.name === PLAYER_ONE_NAME) {
                    if (entity.inventory.length === 1 && entity.inventory[0].name === apple.getName()) {
                        done();
                    }
                }
            });
        });

        addPlayerOne();

        playerOne.on('connect', () => {
            playerOne.emit(EVENTS.take, apple.getName());
        });
    });

    it('should get notified that an entity no longer has an item when one is dropped', (done) => {
        let playerOneHasBeenSeenWithTheApple = false;
        app.entityServer.cave.addItem({ x: 0, y: 0, z: 0 }, apple);

        spectator.on(EVENTS.entities, (entities: EntityState[]) => {
            entities.forEach(entity => {
                if (entity.name === PLAYER_ONE_NAME) {
                    if (playerOneHasBeenSeenWithTheApple) {
                        if (entity.inventory.length === 0) {
                            done();
                        }
                    } else {
                        if (entity.inventory.length === 1 && entity.inventory[0].name === apple.getName()) {
                            playerOneHasBeenSeenWithTheApple = true;
                            playerOne.emit(EVENTS.drop, apple.getName());
                        } else {
                            playerOne.emit(EVENTS.take, apple.getName());
                        }
                    }
                }
            });
        });

        addPlayerOne();
    });

    it('should get notified that an item is now on the map when one is dropped by an entity', (done) => {
        let playerOneHasBeenSeenWithTheApple = false;
        app.entityServer.cave.addItem({ x: 0, y: 0, z: 0 }, apple);

        spectator.on(EVENTS.entities, (entities: EntityState[]) => {
            entities.forEach(entity => {
                if (entity.name === PLAYER_ONE_NAME) {
                    if (entity.inventory.length === 1 && entity.inventory[0].name === apple.getName()) {
                        playerOneHasBeenSeenWithTheApple = true;
                        playerOne.emit(EVENTS.drop, apple.getName());
                    } else {
                        playerOne.emit(EVENTS.take, apple.getName());
                    }
                }
            });
        });

        spectator.on(EVENTS.items, (items: { [location: string]: ItemState[] }) => {
            if (playerOneHasBeenSeenWithTheApple) {
                if (items["(0,0,0)"]) {
                    if (items["(0,0,0)"][0].name === apple.getName()) {
                        done();
                    }
                }
            }
        });

        addPlayerOne();
    });

    it('should get notified when an entity is hit and takes damage', (done) => {
        let playerOneReadyToBeAttacked = false;
        app.entityServer.cave.addItem({ x: 0, y: 0, z: 0 }, dagger);

        spectator.on(EVENTS.entities, (entities: EntityState[]) => {
            entities.forEach(entity => {
                if (entity.name === PLAYER_ONE_NAME) {
                    if (!playerOneReadyToBeAttacked) {
                        // 1) PlayerOne has joined, move south...
                        playerOne.emit(EVENTS.move, DIRS.SOUTH);
                    } else if (entity.hp < 0 && !entity.alive) {
                        // 6) PlayerOne has been killed by PlayerTwo...
                        done();
                    }
                } else if (entity.name === PLAYER_TWO_NAME) {
                    if (entity.inventory.length === 0) {
                        // 3) PlayerTwo has joined, take the dagger...
                        playerTwo.emit(EVENTS.take, dagger.getName());
                    } else if (entity.inventory.length === 1) {
                        if (!entity.currentWeapon) {
                            // 4) PlayerTwo has the dagger, wield it...
                            playerTwo.emit(EVENTS.wield, dagger.getName());
                            spectator.emit(EVENTS.getEntities);
                        } else {
                            // 5) PlayerTwo is wielding the dagger, attack PlayerOne...
                            playerTwo.emit(EVENTS.move, DIRS.SOUTH);
                        }
                    }
                }
            });
        });

        spectator.on(EVENTS.position, (payload: EntityState) => {
            if (payload.id === playerOne.id) {
                // 2) PlayerOne has moved off the entrance, add PlayerTwo...
                playerOneReadyToBeAttacked = true;
                addPlayerTwo();
            }
        });

        addPlayerOne();
    });

    it('should get notified when an entity disconnects', (done) => {
        spectator.on(EVENTS.entities, (entities: EntityState[]) => {
            entities.forEach(entity => {
                if (entity.name === PLAYER_ONE_NAME) {
                    playerOne.disconnect();
                }
            });
        });

        spectator.on(EVENTS.delete, (entity: EntityState) => {
            if (entity.name === PLAYER_ONE_NAME) {
                done();
            }
        });

        addPlayerOne(); 
    });

});
