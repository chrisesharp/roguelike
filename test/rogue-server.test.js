"use strict";

import { ioc } from "../src/server/socket_client";
import http from "http";
import io from "socket.io";
import RogueServer from "../src/server/rogue-server";
import { DIRS } from "../src/common/movement";
import { Tiles } from "../src/server/server-tiles";
import Entity from "../src/common/entity";
import Item from "../src/common/item";
import Rock from "../src/server/items/rock";
import Dagger from "../src/server/items/dagger";
import Apple from "../src/server/items/apple";
import Chainmail from "../src/server/items/chainmail";
 
let socket;
let httpServer;
let httpServerAddr;
let ioServer;
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
  ioServer = io(httpServer);
  app = new RogueServer(ioServer, defaultMap);
  ioServer.on("connection",(socket)=> {
    app.connection(socket);
  });
  done();
});

afterAll((done) => {
  app.stop();
  ioServer.close();
  httpServer.close();
  done();
});

beforeEach((done) => {
  // square brackets are used for IPv6
  socket = ioc.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
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
    app.entities.getEntity(socket.id).pos = defaultPos;
    done();
  });
});

afterEach((done) => {
  if (socket.connected) {
    socket.disconnect();
  }
  app.entities.removeEntity("mock");
  app.cave.removeItem(apple);
  app.cave.removeItem(dagger);
  app.cave.removeItem(rock);
  done();
});


describe('basic socket.io API', () => {
  test('should require prototype', (done) => {
    let new_socket = ioc.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
    transports: ['websocket']
    });
    new_socket.on('missing_role', () => {
      done();
    });
  });

  test('should return default map', (done) => {
    socket.emit('map');
    socket.on('map', (message) => {
      expect(message.width).toBe(defaultMap.width);
      expect(message.height).toBe(defaultMap.height);
      done();
    });
  });

  test('should return default position', (done) => {
    socket.emit('get_position');
    socket.on('position', (payload) => {
      let socket_id = payload[0];
      let message = payload[1];
      expect(socket_id).toBe(socket.id);
      expect(message.x).toBe(defaultPos.x);
      expect(message.y).toBe(defaultPos.y);
      expect(message.z).toBe(defaultPos.z);
      done();
    });
  });

  test('should not move if dead', (done) => {
    let entity = app.entities.getEntity(socket.id);
    entity.alive = false;
    socket.emit('move',DIRS.EAST);
    socket.emit('get_position');
    socket.on('position', (payload) => {
      let socket_id = payload[0];
      let message = payload[1];
      expect(socket_id).toBe(socket.id);
      expect(message.x).toBe(defaultPos.x);
      expect(message.y).toBe(defaultPos.y);
      expect(message.z).toBe(defaultPos.z);
      done();
    });
  });

  test('should move east', (done) => {
    socket.emit('move',DIRS.EAST);
    socket.on('position', (payload) => {
      let socket_id = payload[0];
      let message = payload[1];
      expect(socket_id).toBe(socket.id);
      expect(message.x).toBe(defaultPos.x+1);
      expect(message.y).toBe(defaultPos.y);
      expect(message.z).toBe(defaultPos.z);
      done();
    });
  });

  test('should move west', (done) => {
    socket.emit('move',DIRS.WEST);
    socket.on('position', (payload) => {
      let socket_id = payload[0];
      let message = payload[1];
      expect(socket_id).toBe(socket.id);
      expect(message.x).toBe(defaultPos.x-1);
      expect(message.y).toBe(defaultPos.y);
      expect(message.z).toBe(defaultPos.z);
      done();
    });
  });

  test('should move north', (done) => {
    socket.emit('move', DIRS.NORTH);
    socket.on('position', (payload) => {
      let socket_id = payload[0];
      let message = payload[1];
      expect(socket_id).toBe(socket.id);
      expect(message.x).toBe(defaultPos.x);
      expect(message.y).toBe(defaultPos.y-1);
      expect(message.z).toBe(defaultPos.z);
      done();
    });
  });

  test('should move south', (done) => {
    socket.emit('move', DIRS.SOUTH);
    socket.on('position', (payload) => {
      let socket_id = payload[0];
      let message = payload[1];
      expect(socket_id).toBe(socket.id);
      expect(message.x).toBe(defaultPos.x);
      expect(message.y).toBe(defaultPos.y+1);
      expect(message.z).toBe(defaultPos.z);
      done();
    });
  });

  test('should move up', (done) => {
    app.cave.getMap().addTile(defaultPos.x,defaultPos.y,defaultPos.z, Tiles.stairsUpTile);
    socket.emit('move', DIRS.UP);
    socket.on('message', (msg) => {
      expect(msg).toEqual([`You ascend to level ${defaultPos.z-1}!`]);
      socket.on('position', (payload) => {
        let socket_id = payload[0];
        let pos = payload[1];
        expect(socket_id).toBe(socket.id);
        expect(pos.x).toBe(defaultPos.x);
        expect(pos.y).toBe(defaultPos.y);
        expect(pos.z).toBe(defaultPos.z-1);
  
        done();
      });
    });
    
  });

  test('should descend stairs down', (done) => {
    app.cave.getMap().addTile(defaultPos.x,defaultPos.y,defaultPos.z, Tiles.stairsDownTile);
    socket.emit('move', DIRS.DOWN);
    socket.on('message', (msg) => {
      expect(msg).toEqual([`You descend to level ${defaultPos.z+1}!`]);
      socket.on('position', (payload) => {
        let socket_id = payload[0];
        let pos = payload[1];
        expect(socket_id).toBe(socket.id);
        expect(pos.x).toBe(defaultPos.x);
        expect(pos.y).toBe(defaultPos.y);
        expect(pos.z).toBe(defaultPos.z+1);

        done();
      });
    });
  });

  test('should not descend stairs up', (done) => {
    app.cave.getMap().addTile(defaultPos.x,defaultPos.y,defaultPos.z, Tiles.stairsUpTile);
    socket.emit('move', DIRS.DOWN);
    socket.on('message', (msg) => {
      expect(msg).toEqual(["You can't go that way!"]);
      done();
    });
  });

  test('should not ascend stairs down', (done) => {
    app.cave.getMap().addTile(defaultPos.x,defaultPos.y,defaultPos.z, Tiles.stairsDownTile);
    socket.emit('move', DIRS.UP);
    socket.on('message', (msg) => {
      expect(msg).toEqual(["You can't go that way!"]);
      done();
    });
  });

  test('should not move onto another live entity', (done) => {
    let pos = {x:defaultPos.x+1, y:defaultPos.y, z:defaultPos.z};
    let proto = {name:"Tester", role:"mock", type:"npc", pos:pos};
    app.entities.addEntity("mock", proto);
    socket.emit('move', DIRS.EAST);
    socket.on('message', (msg) => {
      expect(msg).toEqual(["Tester is there."]);
      done();
    });
  });

  test('should not move onto another dead entity', (done) => {
    let pos = {x:defaultPos.x+1, y:defaultPos.y, z:defaultPos.z};
    let proto = {name:"Tester", role:"mock", type:"npc", hp:0, pos:pos};
    app.entities.addEntity("mock", proto);
    socket.emit('move', DIRS.EAST);
    socket.on('message', (msg) => {
      expect(msg).toEqual(['You see a dead Tester.']);
      done();
    });
  });

  test('should update entity if hit', (done) => {
    let entity = app.entities.getEntity(socket.id);
    entity.hitPoints = 2;
    entity.hitFor(1);
    socket.on('update', (msg) => {
      expect(msg.hitPoints).toEqual(1);
      done();
    });
  });

  test('should update entity if killed', (done) => {
    let entity = app.entities.getEntity(socket.id);
    entity.hitPoints = 1;
    entity.hitFor(1);
    socket.on('dead', (msg) => {
      expect(msg.alive).toEqual(false);
      done();
    });
  });

  test('should not move onto non-walkable tiles', (done) => {
    let pos = {x:defaultPos.x+1, y:defaultPos.y, z:defaultPos.z};
    let water = Tiles.waterTile;
    app.cave.map.addTile(pos.x, pos.y, pos.z, water);
    socket.emit('move', DIRS.EAST);
    socket.on('message', (msg) => {
      expect(msg).toEqual(["You cannot walk there."]);
      done();
    });
  });

  test('should see an item in same place', (done) => {
    let pos = {x:defaultPos.x, y:defaultPos.y+1, z:defaultPos.z};
    app.cave.addItem(pos, rock);
    socket.emit('move', DIRS.SOUTH);

    socket.on('message', (msg) => {
      expect(msg).toEqual(['You see a rock.']);
      done();
    });
  });

  test('should see multiple items in same place', (done) => {
    let pos = {x:defaultPos.x, y:defaultPos.y+1, z:defaultPos.z};
    app.cave.addItem(pos, dagger);
    app.cave.addItem(pos, rock);
    socket.emit('move', DIRS.SOUTH);

    socket.on('message', (msg) => {
      expect(msg).toEqual(['There are several objects here.']);
      done();
    });
  });

  test('should provide entities', (done) => {
    socket.emit('get_entities');
    socket.on('entities', (entities) => {
      let entity = new Entity(entities[socket.id]);
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

  test('should provide single item', (done) => {
    app.cave.addItem({x:1,y:1,z:0}, rock);
    socket.emit('get_items');
    socket.on('items', (items) => {
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

  test('should provide multiple items', (done) => {
    app.cave.addItem({x:1,y:1,z:0}, rock);
    app.cave.addItem({x:1,y:1,z:0}, apple);
    socket.emit('get_items');
    socket.on('items', (items) => {
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

  test('should disappear when picked up', (done) => {
    let pos = {x:defaultPos.x, y:defaultPos.y, z:defaultPos.z};
    app.cave.addItem(pos, rock);
    socket.emit('take', 'rock');
    socket.on('items', (msg) => {
      expect(msg).toEqual({});
      done();
    });
  });

  test('should appear when dropped', (done) => {
    let rock = new Rock();
    let dropper = app.entities.getEntity(socket.id);
    dropper.inventory.push(rock);
    let pos = `(${dropper.pos.x},${dropper.pos.y},${dropper.pos.z})`
    socket.emit('drop', 'rock');
    socket.on('items', (msg) => {
      let items = msg[pos];
      expect(items.length).toBe(1);
      expect(new Rock(items[0])).toEqual(rock);
      done();
    });
  });

  test('should not drop non-existent things', (done) => {
    let dagger = new Dagger();
    let dropper = app.entities.getEntity(socket.id);
    dropper.inventory.push(dagger);
    let pos = `(${dropper.pos.x},${dropper.pos.y},${dropper.pos.z})`
    socket.emit('drop', 'rock');
    socket.emit('get_items');
    socket.on('items', (msg) => {
      let items = msg[pos];
      expect(items).toBe(undefined);
      done();
    });
  });

  test('should not disappear when not picked up', (done) => {
    let pos = {x:defaultPos.x, y:defaultPos.y, z:defaultPos.z};
    app.cave.addItem(pos, rock);
    socket.emit('take', 'dagger');
    socket.on('message', (msg) => {
      expect(msg).toEqual(["You cannot take that item."]);
      done();
    });
  });

  test('should be in entities inventory when picked up', (done) => {
    let pos = {x:defaultPos.x, y:defaultPos.y, z:defaultPos.z};
    app.cave.addItem(pos, rock);
    let taker = app.entities.getEntity(socket.id);
    expect(taker.getInventory().length).toBe(0);
    socket.emit('take', 'rock');
    socket.on('message', (msg) => {
      let taker = app.entities.getEntityAt(pos);
      expect(taker.getInventory().length).toBe(1);
      expect(msg).toEqual(["You take the rock."]);
      done();
    });
  });

  test('should disappear from inventory when eaten', (done) => {
    let apple = new Apple();
    let eater = app.entities.getEntity(socket.id);
    eater.inventory.push(apple);
    socket.emit('eat', 'apple');
    socket.on('message', (msg) => {
      expect(msg).toEqual(["You eat the apple."]);
      expect(eater.getInventory()).toEqual([]);
      done();
    });
  });

  test('should disappear from inventory when eaten', (done) => {
    let apple = new Apple();
    let eater = app.entities.getEntity(socket.id);
    eater.inventory.push(apple);
    socket.emit('eat', 'rock');
    socket.on('message', (msg) => {
      expect(msg).toEqual(["You don't have the rock to eat."]);
      expect(eater.getInventory().length).toBe(1);
      done();
    });
  });

  test('should wield a dagger', (done) => {
    let dagger = new Dagger();
    let wielder = app.entities.getEntity(socket.id);
    wielder.inventory.push(dagger);
    socket.emit('wield', 'dagger');
    socket.on('message', (msg) => {
      expect(msg).toEqual(["You are wielding the dagger."]);
      expect(wielder.dealDamage()).toBe(4);
      done();
    });
  });

  test("should not wield a dagger if you don't have one", (done) => {
    let rock = new Rock();
    let wielder = app.entities.getEntity(socket.id);
    wielder.inventory.push(rock);
    socket.emit('wield', 'dagger');
    socket.on('message', (msg) => {
      expect(msg).toEqual(["You don't have any dagger to wield."]);
      done();
    });
  });

  test('should not wield a dagger if wield nothing', (done) => {
    let rock = new Rock();
    let wielder = app.entities.getEntity(socket.id);
    wielder.inventory.push(rock);
    wielder.currentWeapon = rock;
    expect(wielder.isWielding()).toEqual(rock);
    socket.emit('wield', null);
    socket.on('message', (msg) => {
      expect(msg).toEqual(["You are not wielding anything now."]);
      expect(wielder.isWielding()).toBe(null);
      done();
    });
  });

  test('should wear chainmail', (done) => {
    let armour = new Chainmail();
    let wearer = app.entities.getEntity(socket.id);
    wearer.inventory.push(armour);
    socket.emit('wear', 'chainmail');
    socket.on('message', (msg) => {
      expect(msg).toEqual(["You are wearing the chainmail."]);
      expect(wearer.getAC()).toBe(7);
      done();
    });
  });

  test('should not wear chainmail if not in inventory', (done) => {
    let wearer = app.entities.getEntity(socket.id);
    socket.emit('wear', 'chainmail');
    socket.on('message', (msg) => {
      expect(msg).toEqual(["You don't have any chainmail to wear."]);
      expect(wearer.getAC()).toBe(10);
      done();
    });
  });
});