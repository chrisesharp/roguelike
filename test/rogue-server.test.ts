/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable jest/no-done-callback */

import { io, Socket } from 'socket.io-client';
import * as http from 'http';
import { ConnectionServer } from '../src/server/connection-server';
import { DIRS } from '../src/common/movement';
import * as Tiles from '../src/server/server-tiles';
import { EVENTS } from '../src/common/events';
import { Entity, EntityState } from '../src/common/entity';
import { Item, ItemState } from '../src/common/item';
import { Rock } from '../src/server/items/rock';
import { Dagger } from '../src/server/items/dagger';
import { Apple } from '../src/server/items/apple';
import { Chainmail } from '../src/server/items/chainmail';
import { AddressInfo } from 'net';

let socket: Socket;
let httpServer: http.Server;
let httpServerAddr: AddressInfo;
let app: ConnectionServer;
const defaultPos = { x: 2, y: 2, z: 0 };
const rock = new Rock();
const dagger = new Dagger();
const apple = new Apple();

const defaultMap = {
    width: 4,
    height: 5,
    entrance: { x: 0, y: 0, z: 0 },
    gateways: 'test_url',
};

interface Keyed<V> {
    [key: string]: V;
}

beforeAll(() => {
    httpServer = http.createServer();
    httpServerAddr = httpServer.listen().address() as AddressInfo;
    app = new ConnectionServer(httpServer, defaultMap);
});

afterAll(() => {
    app.stop();
    httpServer.close();
});

beforeEach((done) => {
    // square brackets are used for IPv6
    socket = io(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
        transports: ['websocket'],
        auth: {
            name: 'test',
            role: 'testcode'
        }
    });

    socket.on('connect', () => {
        app.entityServer.entities.getEntity(socket.id)!.setPos(defaultPos);
        done();
    });
});

afterEach(() => {
    if (socket.connected) {
        socket.disconnect();
    }
    app.entityServer.entities.removeEntityByID('mock');
    app.entityServer.cave.removeItem(apple);
    app.entityServer.cave.removeItem(dagger);
    app.entityServer.cave.removeItem(rock);
});


describe('basic socket.io API', () => {
    it('should require prototype on connection', (done) => { // eslint-disable-line jest/expect-expect
        const new_socket = io(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
            transports: ['websocket']
        });
        new_socket.on(EVENTS.missingRole, () => {
            done();
        });
    });

    it('should return default map', (done) => {
        socket.emit(EVENTS.getMap);
        // socket.on(EVENTS.map, (message: { width: number; height: number; }) => {
        socket.on(EVENTS.map, (message: { width: number; height: number; }) => {
            expect(message.width).toBe(defaultMap.width);
            expect(message.height).toBe(defaultMap.height);
            done();
        });
    });

    it('should send reset on reset', (done) => { // eslint-disable-line jest/expect-expect
        app.reset();
        socket.on(EVENTS.reset, () => {
            done();
        });
    });

    it('should not move if dead', (done) => {
        const entity = app.entityServer.entities.getEntity(socket.id)!;
        entity.kill();
        socket.emit(EVENTS.move, DIRS.EAST);
        socket.emit(EVENTS.getPosition);
        socket.on(EVENTS.position, (payload: EntityState) => {
            const socket_id = payload.id;
            const message = payload.pos;
            expect(socket_id).toBe(socket.id);
            expect(message.x).toBe(defaultPos.x);
            expect(message.y).toBe(defaultPos.y);
            expect(message.z).toBe(defaultPos.z);
            done();
        });
    });

    it('should move east', (done) => {
        socket.emit(EVENTS.move, DIRS.EAST);
        socket.on(EVENTS.position, (payload: EntityState) => {
            const socket_id = payload.id;
            const message = payload.pos;
            expect(socket_id).toBe(socket.id);
            expect(message.x).toBe(defaultPos.x + 1);
            expect(message.y).toBe(defaultPos.y);
            expect(message.z).toBe(defaultPos.z);
            done();
        });
    });

    it('should move west', (done) => {
        socket.emit(EVENTS.move, DIRS.WEST);
        socket.on(EVENTS.position, (payload: EntityState) => {
            const socket_id = payload.id;
            const message = payload.pos;
            expect(socket_id).toBe(socket.id);
            expect(message.x).toBe(defaultPos.x - 1);
            expect(message.y).toBe(defaultPos.y);
            expect(message.z).toBe(defaultPos.z);
            done();
        });
    });

    it('should move north', (done) => {
        socket.emit(EVENTS.move, DIRS.NORTH);
        socket.on(EVENTS.position, (payload: EntityState) => {
            const socket_id = payload.id;
            const message = payload.pos;
            expect(socket_id).toBe(socket.id);
            expect(message.x).toBe(defaultPos.x);
            expect(message.y).toBe(defaultPos.y - 1);
            expect(message.z).toBe(defaultPos.z);
            done();
        });
    });

    it('should move south', (done) => {
        socket.emit(EVENTS.move, DIRS.SOUTH);
        socket.on(EVENTS.position, (payload: EntityState) => {
            const socket_id = payload.id;
            const message = payload.pos;
            expect(socket_id).toBe(socket.id);
            expect(message.x).toBe(defaultPos.x);
            expect(message.y).toBe(defaultPos.y + 1);
            expect(message.z).toBe(defaultPos.z);
            done();
        });
    });

    it('should move up', (done) => {
        app.entityServer.cave.getMap().addTile(defaultPos.x, defaultPos.y, defaultPos.z, Tiles.stairsUpTile);
        socket.emit(EVENTS.move, DIRS.UP);
        socket.on(EVENTS.message, (msg: string[]) => {
            expect(msg).toEqual([`You ascend to level ${defaultPos.z - 1}!`]);
            socket.on(EVENTS.position, (payload: EntityState) => {
                const socket_id = payload.id;
                const pos = payload.pos;
                expect(socket_id).toBe(socket.id);
                expect(pos.x).toBe(defaultPos.x);
                expect(pos.y).toBe(defaultPos.y);
                expect(pos.z).toBe(defaultPos.z - 1);

                done();
            });
        });

    });

    it('should descend stairs down', (done) => {
        app.entityServer.cave.getMap().addTile(defaultPos.x, defaultPos.y, defaultPos.z, Tiles.stairsDownTile);
        socket.emit(EVENTS.move, DIRS.DOWN);
        socket.on(EVENTS.message, (msg: string[]) => {
            expect(msg).toEqual([`You descend to level ${defaultPos.z + 1}!`]);
            socket.on(EVENTS.position, (payload: EntityState) => {
                const socket_id = payload.id;
                const pos = payload.pos;
                expect(socket_id).toBe(socket.id);
                expect(pos.x).toBe(defaultPos.x);
                expect(pos.y).toBe(defaultPos.y);
                expect(pos.z).toBe(defaultPos.z + 1);

                done();
            });
        });
    });

    it('should not descend stairs up', (done) => {
        app.entityServer.cave.getMap().addTile(defaultPos.x, defaultPos.y, defaultPos.z, Tiles.stairsUpTile);
        socket.emit(EVENTS.move, DIRS.DOWN);
        socket.on(EVENTS.message, (msg: string[]) => {
            expect(msg).toEqual(['You can\'t go that way!']);
            done();
        });
    });

    it('should not ascend stairs down', (done) => {
        app.entityServer.cave.getMap().addTile(defaultPos.x, defaultPos.y, defaultPos.z, Tiles.stairsDownTile);
        socket.emit(EVENTS.move, DIRS.UP);
        socket.on(EVENTS.message, (msg: string[]) => {
            expect(msg).toEqual(["You can't go that way!"]);
            done();
        });
    });

    it('should not move onto another live entity', (done) => {
        const pos = { x: defaultPos.x + 1, y: defaultPos.y, z: defaultPos.z };
        const proto = { name: 'Tester', role: 'mock', type: 'npc', pos: pos };
        app.entityServer.entities.addEntity('mock', proto);
        socket.emit(EVENTS.move, DIRS.EAST);
        socket.on(EVENTS.message, (msg: string[]) => {
            expect(msg).toEqual(['Tester is there.']);
            done();
        });
    });

    it('should not move onto another dead entity', (done) => {
        const pos = { x: defaultPos.x + 1, y: defaultPos.y, z: defaultPos.z };
        const proto = { name: 'Tester', role: 'mock', type: 'npc', hp: 0, pos: pos };
        app.entityServer.entities.addEntity('mock', proto);
        socket.emit(EVENTS.move, DIRS.EAST);
        socket.on(EVENTS.message, (msg: string[]) => {
            expect(msg).toEqual(['You see a dead Tester.']);
            done();
        });
    });

    it('should update entity if hit', (done) => {
        const entity = app.entityServer.entities.getEntity(socket.id)!;
        entity.hitPoints = 2;
        entity.hitFor(1);
        socket.on(EVENTS.update, (msg: EntityState) => {
            try {
                expect(msg.hp).toEqual(1);
            } finally {
                done();
            }
        });
    });

    it('should update entity if killed', (done) => {
        const entity = app.entityServer.entities.getEntity(socket.id)!;
        entity.hitPoints = 1;
        entity.hitFor(1);
        socket.on(EVENTS.dead, (msg: EntityState) => {
            expect(msg.alive).toEqual(false);
            done();
        });
    });

    it('should not move onto non-walkable tiles', (done) => {
        const pos = { x: defaultPos.x + 1, y: defaultPos.y, z: defaultPos.z };
        const water = Tiles.waterTile;
        app.entityServer.cave.map.addTile(pos.x, pos.y, pos.z, water);
        socket.emit(EVENTS.move, DIRS.EAST);
        socket.on(EVENTS.message, (msg: string[]) => {
            expect(msg).toEqual(['You cannot walk there.']);
            done();
        });
    });

    it('should see an item in same place', (done) => {
        const pos = { x: defaultPos.x, y: defaultPos.y + 1, z: defaultPos.z };
        app.entityServer.cave.addItem(pos, rock);
        socket.emit(EVENTS.move, DIRS.SOUTH);

        socket.on(EVENTS.message, (msg: string[]) => {
            expect(msg).toEqual(['You see a rock.']);
            done();
        });
    });

    it('should see multiple items in same place', (done) => {
        const pos = { x: defaultPos.x, y: defaultPos.y + 1, z: defaultPos.z };
        app.entityServer.cave.addItem(pos, dagger);
        app.entityServer.cave.addItem(pos, rock);
        socket.emit(EVENTS.move, DIRS.SOUTH);

        socket.on(EVENTS.message, (msg: string[]) => {
            expect(msg).toEqual(['There are several objects here.']);
            done();
        });
    });

    it('should provide entities', (done) => {
        socket.emit(EVENTS.getEntities);
        socket.on(EVENTS.entities, (entities: EntityState[]) => {
            const entity = new Entity(entities[0]);
            expect(entity.getPos().x).toBe(defaultPos.x);
            expect(entity.getPos().y).toBe(defaultPos.y);
            expect(entity.getPos().z).toBe(defaultPos.z);
            expect(entity.getChar()).toBe('?');
            expect(entity.getDescription()).toBe('testcode');
            expect(entity.isAlive()).toBe(true);
            expect(entity.getHitPoints()).toBe(1);
            done();
        });
    });

    it('should provide single item', (done) => {
        app.entityServer.cave.addItem({ x: 1, y: 1, z: 0 }, rock);
        socket.emit(EVENTS.getItems);
        socket.on(EVENTS.items, (items: Keyed<ItemState[]>) => {
            try {
                const key = '(1,1,0)';
                expect(items[key].length).toBe(1);
                const item = new Item(items[key][0]);
                expect(item.getPos()).toEqual({ x: 1, y: 1, z: 0 });
                expect(item.getChar()).toBe('*');
                expect(item.getDescription()).toBe('rock');
            } finally {
                done();
            }
        });
    });

    it('should provide multiple items', (done) => {
        app.entityServer.cave.addItem({ x: 1, y: 1, z: 0 }, rock);
        app.entityServer.cave.addItem({ x: 1, y: 1, z: 0 }, apple);
        socket.emit(EVENTS.getItems);
        socket.on(EVENTS.items, (items: Keyed<ItemState[]>) => {
            const key = '(1,1,0)';
            expect(items[key].length).toBe(2);
            const rock = new Item(items[key][0]);
            expect(rock.getPos().x).toBe(1);
            expect(rock.getPos().y).toBe(1);
            expect(rock.getPos().z).toBe(0);
            expect(rock.getChar()).toBe('*');
            expect(rock.getDescription()).toBe('rock');
            const dagger = new Item(items[key][1]);
            expect(dagger.getPos().x).toBe(1);
            expect(dagger.getPos().y).toBe(1);
            expect(dagger.getPos().z).toBe(0);
            expect(dagger.getChar()).toBe('o');
            expect(dagger.getDescription()).toBe('apple');
            done();
        });
    });

    it('should disappear when picked up', (done) => {
        const pos = { x: defaultPos.x, y: defaultPos.y, z: defaultPos.z };
        app.entityServer.cave.addItem(pos, rock);
        socket.emit(EVENTS.take, 'rock');
        socket.on(EVENTS.items, (msg: Keyed<ItemState[]>) => {
            expect(msg).toEqual({});
            done();
        });
    });

    it('should appear when dropped', (done) => {
        app.entityServer.cave.items = {};
        const rock = new Rock();
        const dropper = app.entityServer.entities.getEntity(socket.id)!;
        dropper.inventory.push(rock);
        const pos = `(${dropper.getPos().x},${dropper.getPos().y},${dropper.getPos().z})`
        socket.emit(EVENTS.drop, 'rock');
        socket.on(EVENTS.items, (msg: Keyed<ItemState[]>) => {
            const items = msg[pos];
            expect(items.length).toBe(1);
            expect(new Rock(items[0])).toEqual(rock);
            done();
        });
    });

    it('should not drop non-existent things', (done) => {
        const dagger = new Dagger();
        const dropper = app.entityServer.entities.getEntity(socket.id)!;
        dropper.inventory.push(dagger);
        const pos = `(${dropper.getPos().x},${dropper.getPos().y},${dropper.getPos().z})`
        socket.emit(EVENTS.drop, 'rock');
        socket.emit(EVENTS.getItems);
        socket.on(EVENTS.items, (msg: Keyed<ItemState[]>) => {
            const items = msg[pos];
            expect(items).toBe(undefined);
            done();
        });
    });

    it('should not disappear when not picked up', (done) => {
        const pos = { x: defaultPos.x, y: defaultPos.y, z: defaultPos.z };
        app.entityServer.cave.items = {}
        app.entityServer.cave.addItem(pos, rock);
        socket.emit(EVENTS.take, 'dagger');
        socket.on(EVENTS.message, (msg: string[]) => {
            expect(msg).toEqual(['You cannot take that item.']);
            done();
        });
    });

    it('should be in entities inventory when picked up', (done) => {
        const pos = { x: defaultPos.x, y: defaultPos.y, z: defaultPos.z };
        app.entityServer.cave.addItem(pos, rock);
        const taker = app.entityServer.entities.getEntity(socket.id)!;
        expect(taker.getInventory().length).toBe(0);
        socket.emit(EVENTS.take, 'rock');
        socket.on(EVENTS.message, (msg: string[]) => {
            const taker = app.entityServer.entities.getEntityAt(pos)!;
            expect(taker.getInventory().length).toBe(1);
            expect(msg).toEqual(['You take the rock.']);
            done();
        });
    });

    it('should disappear from inventory when eaten', (done) => {
        const apple = new Apple();
        const eater = app.entityServer.entities.getEntity(socket.id)!;
        eater.inventory.push(apple);
        socket.emit(EVENTS.eat, 'apple');
        socket.on(EVENTS.message, (msg: string[]) => {
            expect(msg).toEqual(['You eat the apple.']);
            expect(eater.getInventory()).toEqual([]);
            done();
        });
    });

    it('should not eat items not carried', (done) => {
        const apple = new Apple();
        const eater = app.entityServer.entities.getEntity(socket.id)!;
        eater.inventory.push(apple);
        socket.emit(EVENTS.eat, 'rock');
        socket.on(EVENTS.message, (msg: string[]) => {
            expect(msg).toEqual(["You don't have the rock to eat."]);
            expect(eater.getInventory().length).toBe(1);
            done();
        });
    });

    it('should wield a dagger', (done) => {
        const dagger = new Dagger();
        const wielder = app.entityServer.entities.getEntity(socket.id)!;
        wielder.inventory.push(dagger);
        socket.emit(EVENTS.wield, 'dagger');
        socket.on(EVENTS.message, (msg: string[]) => {
            expect(msg).toEqual(['You are wielding the dagger.']);
            expect(wielder.dealDamage()).toBe(4);
            done();
        });
    });

    it('should not wield a dagger if you don\'t have one', (done) => {
        const rock = new Rock();
        const wielder = app.entityServer.entities.getEntity(socket.id)!;
        wielder.inventory.push(rock);
        socket.emit(EVENTS.wield, 'dagger');
        socket.on(EVENTS.message, (msg: string[]) => {
            expect(msg).toEqual(["You don't have any dagger to wield."]);
            done();
        });
    });

    it('should not wield a dagger if wield nothing', (done) => {
        const rock = new Rock();
        const wielder = app.entityServer.entities.getEntity(socket.id)!;
        wielder.inventory.push(rock);
        wielder.currentWeapon = rock;
        expect(wielder.isWielding()).toBe(true);
        socket.emit(EVENTS.wield, null);
        socket.on(EVENTS.message, (msg: string[]) => {
            expect(msg).toEqual(['You are not wielding anything now.']);
            expect(wielder.isWielding()).toBe(false);
            done();
        });
    });

    it('should wear chainmail', (done) => {
        const armour = new Chainmail();
        const wearer = app.entityServer.entities.getEntity(socket.id)!;
        wearer.inventory.push(armour);
        socket.emit(EVENTS.wear, 'chainmail');
        socket.on(EVENTS.message, (msg: string[]) => {
            expect(msg).toEqual(['You are wearing the chainmail.']);
            expect(wearer.getAC()).toBe(7);
            done();
        });
    });

    it('should not wear chainmail if not in inventory', (done) => {
        const wearer = app.entityServer.entities.getEntity(socket.id)!;
        socket.emit(EVENTS.wear, 'chainmail');
        socket.on(EVENTS.message, (msg: string[]) => {
            expect(msg).toEqual(['You don\'t have any chainmail to wear.']);
            expect(wearer.getAC()).toBe(10);
            done();
        });
    });
});
