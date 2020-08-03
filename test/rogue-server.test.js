"use strict";

import io from "socket.io-client";
import http from "http";
import ConnectionServer from "../src/server/connection-server";
import { DIRS } from "../src/common/movement";
import { Tiles } from "../src/server/server-tiles";
import { EVENTS } from "../src/common/events";
import Entity from "../src/common/entity";
import Item from "../src/common/item";
import Rock from "../src/server/items/rock";
import Dagger from "../src/server/items/dagger";
import Apple from "../src/server/items/apple";
import Chainmail from "../src/server/items/chainmail";
 
let socket;
let httpServer;
let httpServerAddr;
let app;
const defaultPos = {"x":2,"y":2,"z":0};
const rock = new Rock();
const dagger = new Dagger();
const apple = new Apple();

const defaultMap = {
  "width":4,
  "height":5,
};


beforeAll((done) => {
  httpServer = http.createServer();
  httpServerAddr = httpServer.listen().address();
  app = new ConnectionServer(httpServer, defaultMap);
  done();
});

afterAll((done) => {
  app.stop();
  httpServer.close();
  done();
});

beforeEach((done) => {
  // square brackets are used for IPv6
  socket = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
    transports: ['websocket'],
    query: {
      name: 'test',
      role: 'testcode'
    }
  });

  socket.on('connect', () => {
    app.rogueServer.entities.getEntity(socket.id).pos = defaultPos;
    done();
  });
});

afterEach((done) => {
  if (socket.connected) {
    socket.disconnect();
  }
  app.rogueServer.entities.removeEntityByID("mock");
  app.rogueServer.cave.removeItem(apple);
  app.rogueServer.cave.removeItem(dagger);
  app.rogueServer.cave.removeItem(rock);
  done();
});


describe('basic socket.io API', () => {
  it('should require prototype on connection', (done) => {
    let new_socket = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
    transports: ['websocket']
    });
    new_socket.on(EVENTS.missingRole, () => {
      done();
    });
  });

  it('should return default map', (done) => {
    socket.emit(EVENTS.getMap);
    socket.on(EVENTS.map, (message) => {
      expect(message.width).toBe(defaultMap.width);
      expect(message.height).toBe(defaultMap.height);
      done();
    });
  });

  it('should send reset on reset', (done) => {
    app.reset();
    socket.on(EVENTS.reset, () => {
        done();
    });
  });

  it('should not move if dead', (done) => {
    let entity = app.rogueServer.entities.getEntity(socket.id);
    entity.alive = false;
    socket.emit(EVENTS.move, DIRS.EAST);
    socket.emit(EVENTS.getPosition);
    socket.on(EVENTS.position, (payload) => {
      let socket_id = payload.id;
      let message = payload.pos;
      expect(socket_id).toBe(socket.id);
      expect(message.x).toBe(defaultPos.x);
      expect(message.y).toBe(defaultPos.y);
      expect(message.z).toBe(defaultPos.z);
      done();
    });
  });

  it('should move east', (done) => {
    socket.emit(EVENTS.move,DIRS.EAST);
    socket.on(EVENTS.position, (payload) => {
      let socket_id = payload.id;
      let message = payload.pos;
      expect(socket_id).toBe(socket.id);
      expect(message.x).toBe(defaultPos.x+1);
      expect(message.y).toBe(defaultPos.y);
      expect(message.z).toBe(defaultPos.z);
      done();
    });
  });

  it('should move west', (done) => {
    socket.emit(EVENTS.move, DIRS.WEST);
    socket.on(EVENTS.position, (payload) => {
      let socket_id = payload.id;
      let message = payload.pos;
      expect(socket_id).toBe(socket.id);
      expect(message.x).toBe(defaultPos.x-1);
      expect(message.y).toBe(defaultPos.y);
      expect(message.z).toBe(defaultPos.z);
      done();
    });
  });

  it('should move north', (done) => {
    socket.emit(EVENTS.move, DIRS.NORTH);
    socket.on(EVENTS.position, (payload) => {
      let socket_id = payload.id;
      let message = payload.pos;
      expect(socket_id).toBe(socket.id);
      expect(message.x).toBe(defaultPos.x);
      expect(message.y).toBe(defaultPos.y-1);
      expect(message.z).toBe(defaultPos.z);
      done();
    });
  });

  it('should move south', (done) => {
    socket.emit(EVENTS.move, DIRS.SOUTH);
    socket.on(EVENTS.position, (payload) => {
      let socket_id = payload.id;
      let message = payload.pos;
      expect(socket_id).toBe(socket.id);
      expect(message.x).toBe(defaultPos.x);
      expect(message.y).toBe(defaultPos.y+1);
      expect(message.z).toBe(defaultPos.z);
      done();
    });
  });

  it('should move up', (done) => {
    app.rogueServer.cave.getMap().addTile(defaultPos.x,defaultPos.y,defaultPos.z, Tiles.stairsUpTile);
    socket.emit(EVENTS.move, DIRS.UP);
    socket.on(EVENTS.message, (msg) => {
      expect(msg).toEqual([`You ascend to level ${defaultPos.z-1}!`]);
      socket.on(EVENTS.position, (payload) => {
        let socket_id = payload.id;
        let pos = payload.pos;
        expect(socket_id).toBe(socket.id);
        expect(pos.x).toBe(defaultPos.x);
        expect(pos.y).toBe(defaultPos.y);
        expect(pos.z).toBe(defaultPos.z-1);
  
        done();
      });
    });
    
  });

  it('should descend stairs down', (done) => {
    app.rogueServer.cave.getMap().addTile(defaultPos.x,defaultPos.y,defaultPos.z, Tiles.stairsDownTile);
    socket.emit(EVENTS.move, DIRS.DOWN);
    socket.on(EVENTS.message, (msg) => {
      expect(msg).toEqual([`You descend to level ${defaultPos.z+1}!`]);
      socket.on(EVENTS.position, (payload) => {
        let socket_id = payload.id;
        let pos = payload.pos;
        expect(socket_id).toBe(socket.id);
        expect(pos.x).toBe(defaultPos.x);
        expect(pos.y).toBe(defaultPos.y);
        expect(pos.z).toBe(defaultPos.z+1);

        done();
      });
    });
  });

  it('should not descend stairs up', (done) => {
    app.rogueServer.cave.getMap().addTile(defaultPos.x,defaultPos.y,defaultPos.z, Tiles.stairsUpTile);
    socket.emit(EVENTS.move, DIRS.DOWN);
    socket.on(EVENTS.message, (msg) => {
      expect(msg).toEqual(["You can't go that way!"]);
      done();
    });
  });

  it('should not ascend stairs down', (done) => {
    app.rogueServer.cave.getMap().addTile(defaultPos.x,defaultPos.y,defaultPos.z, Tiles.stairsDownTile);
    socket.emit(EVENTS.move, DIRS.UP);
    socket.on(EVENTS.message, (msg) => {
      expect(msg).toEqual(["You can't go that way!"]);
      done();
    });
  });

  it('should not move onto another live entity', (done) => {
    let pos = {x:defaultPos.x+1, y:defaultPos.y, z:defaultPos.z};
    let proto = {name:"Tester", role:"mock", type:"npc", pos:pos};
    app.rogueServer.entities.addEntity("mock", proto);
    socket.emit(EVENTS.move, DIRS.EAST);
    socket.on(EVENTS.message, (msg) => {
      expect(msg).toEqual(["Tester is there."]);
      done();
    });
  });

  it('should not move onto another dead entity', (done) => {
    let pos = {x:defaultPos.x+1, y:defaultPos.y, z:defaultPos.z};
    let proto = {name:"Tester", role:"mock", type:"npc", hp:0, pos:pos};
    app.rogueServer.entities.addEntity("mock", proto);
    socket.emit(EVENTS.move, DIRS.EAST);
    socket.on(EVENTS.message, (msg) => {
      expect(msg).toEqual(['You see a dead Tester.']);
      done();
    });
  });

  it('should update entity if hit', (done) => {
    let entity = app.rogueServer.entities.getEntity(socket.id);
    entity.hitPoints = 2;
    entity.hitFor(1);
    socket.on(EVENTS.update, (msg) => {
      expect(msg.hitPoints).toEqual(1);
      done();
    });
  });

  it('should update entity if killed', (done) => {
    let entity = app.rogueServer.entities.getEntity(socket.id);
    entity.hitPoints = 1;
    entity.hitFor(1);
    socket.on(EVENTS.dead, (msg) => {
      expect(msg.alive).toEqual(false);
      done();
    });
  });

  it('should not move onto non-walkable tiles', (done) => {
    let pos = {x:defaultPos.x+1, y:defaultPos.y, z:defaultPos.z};
    let water = Tiles.waterTile;
    app.rogueServer.cave.map.addTile(pos.x, pos.y, pos.z, water);
    socket.emit(EVENTS.move, DIRS.EAST);
    socket.on(EVENTS.message, (msg) => {
      expect(msg).toEqual(["You cannot walk there."]);
      done();
    });
  });

  it('should see an item in same place', (done) => {
    let pos = {x:defaultPos.x, y:defaultPos.y+1, z:defaultPos.z};
    app.rogueServer.cave.addItem(pos, rock);
    socket.emit(EVENTS.move, DIRS.SOUTH);

    socket.on(EVENTS.message, (msg) => {
      expect(msg).toEqual(['You see a rock.']);
      done();
    });
  });

  it('should see multiple items in same place', (done) => {
    let pos = {x:defaultPos.x, y:defaultPos.y+1, z:defaultPos.z};
    app.rogueServer.cave.addItem(pos, dagger);
    app.rogueServer.cave.addItem(pos, rock);
    socket.emit(EVENTS.move, DIRS.SOUTH);

    socket.on(EVENTS.message, (msg) => {
      expect(msg).toEqual(['There are several objects here.']);
      done();
    });
  });

  it('should provide entities', (done) => {
    socket.emit(EVENTS.getEntities);
    socket.on(EVENTS.entities, (entities) => {
      let entity = new Entity(entities[0]);
      expect(entity.pos.x).toBe(defaultPos.x);
      expect(entity.pos.y).toBe(defaultPos.y);
      expect(entity.pos.z).toBe(defaultPos.z);
      expect(entity.getGlyph().getChar()).toBe('?');
      expect(entity.getDescription()).toBe('testcode');
      expect(entity.isAlive()).toBe(true);
      expect(entity.getHitPoints()).toBe(1);
      done();
    });
  });

  it('should provide single item', (done) => {
    app.rogueServer.cave.addItem({x:1,y:1,z:0}, rock);
    socket.emit(EVENTS.getItems);
    socket.on(EVENTS.items, (items) => {
      let key = "(1,1,0)";
      expect(items[key].length).toBe(1);
      let item = new Item(items[key][0]);
      expect(item.pos.x).toBe(1);
      expect(item.pos.y).toBe(1);
      expect(item.pos.z).toBe(0);
      expect(item.getGlyph().getChar()).toBe('*');
      expect(item.getDescription()).toBe('rock');
      done();
    });
  });

  it('should provide multiple items', (done) => {
    app.rogueServer.cave.addItem({x:1,y:1,z:0}, rock);
    app.rogueServer.cave.addItem({x:1,y:1,z:0}, apple);
    socket.emit(EVENTS.getItems);
    socket.on(EVENTS.items, (items) => {
      let key = "(1,1,0)";
      expect(items[key].length).toBe(2);
      let rock = new Item(items[key][0]);
      expect(rock.pos.x).toBe(1);
      expect(rock.pos.y).toBe(1);
      expect(rock.pos.z).toBe(0);
      expect(rock.getGlyph().getChar()).toBe('*');
      expect(rock.getDescription()).toBe('rock');
      let dagger = new Item(items[key][1]);
      expect(dagger.pos.x).toBe(1);
      expect(dagger.pos.y).toBe(1);
      expect(dagger.pos.z).toBe(0);
      expect(dagger.getGlyph().getChar()).toBe('o');
      expect(dagger.getDescription()).toBe('apple');
      done();
    });
  });

  it('should disappear when picked up', (done) => {
    let pos = {x:defaultPos.x, y:defaultPos.y, z:defaultPos.z};
    app.rogueServer.cave.addItem(pos, rock);
    socket.emit(EVENTS.take, 'rock');
    socket.on(EVENTS.items, (msg) => {
      expect(msg).toEqual({});
      done();
    });
  });

  it('should appear when dropped', (done) => {
    app.rogueServer.cave.items = {};
    let rock = new Rock();
    let dropper = app.rogueServer.entities.getEntity(socket.id);
    dropper.inventory.push(rock);
    let pos = `(${dropper.pos.x},${dropper.pos.y},${dropper.pos.z})`
    socket.emit(EVENTS.drop, 'rock');
    socket.on(EVENTS.items, (msg) => {
      let items = msg[pos];
      expect(items.length).toBe(1);
      expect(new Rock(items[0])).toEqual(rock);
      done();
    });
  });

  it('should not drop non-existent things', (done) => {
    let dagger = new Dagger();
    let dropper = app.rogueServer.entities.getEntity(socket.id);
    dropper.inventory.push(dagger);
    let pos = `(${dropper.pos.x},${dropper.pos.y},${dropper.pos.z})`
    socket.emit(EVENTS.drop, 'rock');
    socket.emit(EVENTS.getItems);
    socket.on(EVENTS.items, (msg) => {
      let items = msg[pos];
      expect(items).toBe(undefined);
      done();
    });
  });

  it('should not disappear when not picked up', (done) => {
    let pos = {x:defaultPos.x, y:defaultPos.y, z:defaultPos.z};
    app.rogueServer.cave.items = {}
    app.rogueServer.cave.addItem(pos, rock);
    socket.emit(EVENTS.take, 'dagger');
    socket.on(EVENTS.message, (msg) => {
      expect(msg).toEqual(["You cannot take that item."]);
      done();
    });
  });

  it('should be in entities inventory when picked up', (done) => {
    let pos = {x:defaultPos.x, y:defaultPos.y, z:defaultPos.z};
    app.rogueServer.cave.addItem(pos, rock);
    let taker = app.rogueServer.entities.getEntity(socket.id);
    expect(taker.getInventory().length).toBe(0);
    socket.emit(EVENTS.take, 'rock');
    socket.on(EVENTS.message, (msg) => {
      let taker = app.rogueServer.entities.getEntityAt(pos);
      expect(taker.getInventory().length).toBe(1);
      expect(msg).toEqual(["You take the rock."]);
      done();
    });
  });

  it('should disappear from inventory when eaten', (done) => {
    let apple = new Apple();
    let eater = app.rogueServer.entities.getEntity(socket.id);
    eater.inventory.push(apple);
    socket.emit(EVENTS.eat, 'apple');
    socket.on(EVENTS.message, (msg) => {
      expect(msg).toEqual(["You eat the apple."]);
      expect(eater.getInventory()).toEqual([]);
      done();
    });
  });

  it('should disappear from inventory when eaten', (done) => {
    let apple = new Apple();
    let eater = app.rogueServer.entities.getEntity(socket.id);
    eater.inventory.push(apple);
    socket.emit(EVENTS.eat, 'rock');
    socket.on(EVENTS.message, (msg) => {
      expect(msg).toEqual(["You don't have the rock to eat."]);
      expect(eater.getInventory().length).toBe(1);
      done();
    });
  });

  it('should wield a dagger', (done) => {
    let dagger = new Dagger();
    let wielder = app.rogueServer.entities.getEntity(socket.id);
    wielder.inventory.push(dagger);
    socket.emit(EVENTS.wield, 'dagger');
    socket.on(EVENTS.message, (msg) => {
      expect(msg).toEqual(["You are wielding the dagger."]);
      expect(wielder.dealDamage()).toBe(4);
      done();
    });
  });

  it("should not wield a dagger if you don't have one", (done) => {
    let rock = new Rock();
    let wielder = app.rogueServer.entities.getEntity(socket.id);
    wielder.inventory.push(rock);
    socket.emit(EVENTS.wield, 'dagger');
    socket.on(EVENTS.message, (msg) => {
      expect(msg).toEqual(["You don't have any dagger to wield."]);
      done();
    });
  });

  it('should not wield a dagger if wield nothing', (done) => {
    let rock = new Rock();
    let wielder = app.rogueServer.entities.getEntity(socket.id);
    wielder.inventory.push(rock);
    wielder.currentWeapon = rock;
    expect(wielder.isWielding()).toEqual(rock);
    socket.emit(EVENTS.wield, null);
    socket.on(EVENTS.message, (msg) => {
      expect(msg).toEqual(["You are not wielding anything now."]);
      expect(wielder.isWielding()).toBe(null);
      done();
    });
  });

  it('should wear chainmail', (done) => {
    let armour = new Chainmail();
    let wearer = app.rogueServer.entities.getEntity(socket.id);
    wearer.inventory.push(armour);
    socket.emit(EVENTS.wear, 'chainmail');
    socket.on(EVENTS.message, (msg) => {
      expect(msg).toEqual(["You are wearing the chainmail."]);
      expect(wearer.getAC()).toBe(7);
      done();
    });
  });

  it('should not wear chainmail if not in inventory', (done) => {
    let wearer = app.rogueServer.entities.getEntity(socket.id);
    socket.emit(EVENTS.wear, 'chainmail');
    socket.on(EVENTS.message, (msg) => {
      expect(msg).toEqual(["You don't have any chainmail to wear."]);
      expect(wearer.getAC()).toBe(10);
      done();
    });
  });
});