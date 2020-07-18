"use strict";

import http from "http";
import SocketServer from "../src/server/socket-server";
import GoblinBot from "../src/monsters/goblin-bot";
import { Tiles } from "../src/server/server-tiles";
import { DIRS } from "../src/common/movement";
import { EVENTS } from "../src/common/events";
import Rock from "../src/server/items/rock";
import Dagger from "../src/server/items/dagger";
import Apple from "../src/server/items/apple";
import Chainmail from "../src/server/items/chainmail";
import Item from "../src/common/item";

const rock = new Rock();
const dagger = new Dagger();
const apple = new Apple();
const chainmail = new Chainmail();

let httpServer;
let httpServerAddr;
let app;
const defaultPos = {"x":2,"y":2,"z":0};

const defaultMap = {
  "width":4,
  "height":5,
};


beforeAll((done) => {
  done();
});

afterAll((done) => {
  done();
});

beforeEach((done) => {
  httpServer = http.createServer();
  httpServerAddr = httpServer.listen().address();
  app = new SocketServer(httpServer, defaultMap);
  done();
});

afterEach((done) => {
  app.stop();
  httpServer.close();
  app = null;
  httpServer = null;
  done();
});


describe('monster connects to server', () => {
  it('should use supplied brain', (done) => {
    let mockBrain = {ready: (event)=>{ done();}};
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    bot.start();
  });

  it('should get pings', (done) => {
    let mockBrain = {setMap: ()=>{}, ready: (event)=>{ if (event === EVENTS.ping) {expect(event).toBe(EVENTS.ping); done();}}};
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    bot.start();
  });

  it('should return default map', (done) => {
    app.rogueServer.cave.getMap().addTile(defaultPos.x,defaultPos.y,defaultPos.z, Tiles.stairsUpTile);
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
    bot.start(defaultPos, (event) => {
      if (event === EVENTS.map) {
        expect(bot.brain.map.getWidth()).toBe(defaultMap.width);
        expect(bot.brain.map.getHeight()).toBe(defaultMap.height);
        expect(bot.brain.map.getTile(defaultPos.x, defaultPos.y, defaultPos.z)).toEqual(Tiles.stairsUpTile);
        expect(bot.brain.map.getTile(-1,-1,-1)).toEqual(Tiles.nullTile);
        bot.stop();
        done();
      }
    });    
  });

  it('should move', (done) => {
    let newPos = {x:defaultPos.x, y:defaultPos.y+1, z:defaultPos.z}
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
    bot.start(defaultPos, (event) => {
      if (event === EVENTS.map) {
        bot.move(DIRS.SOUTH);
      }
      if (event == EVENTS.position) {
        expect(bot.client.getEntity().pos).toEqual(newPos);
        bot.stop();
        done();
      }
    });    
  });

  it('should see items ', (done) => {
    let pos = {x:defaultPos.x, y:defaultPos.y+1, z:defaultPos.z};
    app.rogueServer.cave.addItem(pos, dagger);
    app.rogueServer.cave.addItem(pos, rock);
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
    bot.start(defaultPos, (event) => {
      let goblin = bot.client.getEntity();
      if (event === EVENTS.items) {
        bot.move(DIRS.SOUTH);
      } else if (event == EVENTS.message) {
        expect(bot.messages.pop()).toBe("There are several objects here.");
        expect(goblin.getSightRadius()).toBe(20);
        bot.stop();
        done();
      }
    });
  });

  it('should see new items changing rooms ', (done) => {
    app.rogueServer.cave.getMap().addTile(defaultPos.x,defaultPos.y,defaultPos.z, Tiles.stairsDownTile);
    let pos = {x:defaultPos.x, y:defaultPos.y, z:defaultPos.z+1};
    app.rogueServer.cave.addItem(pos, dagger);
    app.rogueServer.cave.addItem(pos, rock);
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
    let descended = false;
    bot.start(defaultPos, (event) => {
      if (event === EVENTS.map) {
        bot.move(DIRS.DOWN);
      }

      if (event === EVENTS.message) {
        expect(bot.messages.pop()).toBe("You descend to level 1!");
      }

      if (event === EVENTS.position) {
        if (bot.client.getEntity().pos.z === pos.z) {
          descended = true;
        }
      }
      if (event === EVENTS.items && descended) {
        expect(bot.client.getItemsAt(pos.x, pos.y, pos.z).length).toBe(2);
        bot.stop();
        done();
      }
    });
  });

  it('should see other entities', (done) => {
    let mockBrain = {ready: (event)=>{ done();},setMap: ()=> {}};
    let pos = {x:defaultPos.x, y:defaultPos.y+1, z:defaultPos.z};
    let bot1 = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    let bot2 = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    bot1.start(pos, () => {
      bot2.start(defaultPos, (event) => {
        if (event === EVENTS.message) {
          expect(bot1.messages[0]).toBe("a goblin just entered this cave.");
        }
        if (event === EVENTS.entities) {
          let goblin = bot1.client.getEntity();
          let pos = goblin.pos;
          let entity = bot2.client.getEntityAt(pos.x, pos.y, pos.z);
          expect(entity.getGlyph().getChar()).toEqual("&");
          done();
        }
      }); 
    });
  });

  it('should refresh entities if out of sync', (done) => {
    let pos = {x:defaultPos.x+1, y:defaultPos.y, z:defaultPos.z};
    let proto = {name:"Tester", role:"mock", type:"npc", hp:0, pos:pos};
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
    let count = 0;
    bot.start(defaultPos, (event) => {
      if (event === EVENTS.map) {
        app.rogueServer.entities.addEntity("mock", proto);
        app.rogueServer.messaging.sendToAll("position",{id:"mock", pos:pos});
      }
      if (event === EVENTS.entities) {
        if (count) {
          let entity = bot.client.getEntityAt(pos.x, pos.y, pos.z);
          expect(entity.pos).toEqual(pos);
          bot.stop();
          done();
        }
        count++;
      }
    }); 
  });

  it('should die', (done) => {
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
    bot.start(defaultPos, (event) => {
      if (event === EVENTS.map) {
        expect(bot.client.getEntity().isAlive()).toBe(true);
        let goblin = app.rogueServer.entities.getEntityAt(defaultPos);
        goblin.hitFor(10);
      }
      if (event === EVENTS.dead) {
        expect(bot.client.getEntity().isAlive()).toBe(false);
        bot.stop();
        done();
      }
    });
  });

  it('should see other entities move', (done) => {
    let pos1 = {x:defaultPos.x, y:defaultPos.y+1, z:defaultPos.z};
    let pos2 = {x:defaultPos.x, y:defaultPos.y+2, z:defaultPos.z};
    let bot1 = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
    let bot2 = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
    let bot2moved = false;
    bot1.start(defaultPos, (event) => {
      bot2.start(pos1, (event) => {
        if (event === EVENTS.map && !bot2moved) {
          bot2moved = true;
          bot2.move(DIRS.SOUTH);
        }
        
      }); 
      if (event === EVENTS.position) {
        let other = bot1.client.getEntityAt(pos2.x, pos2.y, pos2.z);
        expect(other.getDescription()).toEqual(bot2.client.getEntity().getDescription());
        done();
      }
    });
  });

  it('should take and wield item', (done) => {
    app.rogueServer.cave.addItem(defaultPos, dagger);
    let theDagger = app.rogueServer.cave.getItemsAt(defaultPos)[0];
    expect(theDagger.isWieldable()).toBe(true);
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
    let count = -1;
    bot.start(defaultPos, (event) => {
      let goblin = bot.client.getEntity();
      if (event === EVENTS.map) {
        bot.client.takeItem(theDagger);
      }
      if (event === EVENTS.items) {
        count++;
        let pos = goblin.pos;
        let items = bot.client.getItemsAt(pos.x, pos.y, pos.z);
        if (count === 1) {
          expect(items.length).toBe(1);
        }
        if (count === 2) {
          expect(items).toBe(undefined);
          let item = new Item(goblin.getInventory()[0]);
          expect(item.getDescription()).toBe("dagger");
          bot.client.wieldItem(theDagger);
        }
      }
      if (event === EVENTS.message && count >= 2) {
        expect(bot.messages.pop()).toEqual('You are wielding the dagger.');
        count++;
      }

      if (event === EVENTS.update && count < 2) {
        expect(goblin.getWeapon()).toBe("");
      }

      if (event === EVENTS.update && count > 2) {
        expect(goblin.getWeapon()).toBe("dagger");
        count++;
      }
      if (count > 3) { bot.stop();done(); }
    });
  });

  it('should unwield an item', (done) => {
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
    let goblin = bot.client.getEntity();
    goblin.inventory = ["dagger"];
    bot.start(defaultPos, (event) => {
      if (event === EVENTS.map) {
        bot.client.wieldItem();
      }

      if (event === EVENTS.message) {
        expect(bot.messages.pop()).toEqual('You are not wielding anything now.');
        done();
      }
    });
  });

  it('should take and eat item', (done) => {
    app.rogueServer.cave.addItem(defaultPos, apple);
    let theApple = app.rogueServer.cave.getItemsAt(defaultPos)[0];
    expect(theApple.isEdible()).toBe(true);
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
    let count = -1;
    bot.start(defaultPos, (event) => {
      if (event === EVENTS.map) {
        bot.client.takeItem(theApple);
      }
      if (event === EVENTS.items) {
        count++;
        let goblin = bot.client.getEntity();
        let pos = goblin.pos;
        let items = bot.client.getItemsAt(pos.x, pos.y, pos.z);
        if (count === 1) {
          expect(items.length).toBe(1);
        }
        if (count === 2) {
          expect(items).toBe(undefined);
          let item = new Item(goblin.getInventory()[0]);
          expect(item.getDescription()).toBe("apple");
          bot.client.eat(theApple);
        }
      }
      if (event === EVENTS.message && count >= 2) {
        expect(bot.messages.pop()).toEqual('You eat the apple.');
        count++;
      }
      if (count > 2) { bot.stop();done(); }
    });
  });

  it('should take and wear item', (done) => {
    app.rogueServer.cave.addItem(defaultPos, chainmail);
    let theArmour = app.rogueServer.cave.getItemsAt(defaultPos)[0];
    expect(theArmour.isWearable()).toBe(true);
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
    let count = -1;
    bot.start(defaultPos, (event) => {
      let goblin = bot.client.getEntity();
      if (event === EVENTS.map) {
        bot.client.takeItem(theArmour);
      }
      if (event === EVENTS.items) {
        count++;
        let pos = goblin.pos;
        let items = bot.client.getItemsAt(pos.x, pos.y, pos.z);
        if (count === 1) {
          expect(items.length).toBe(1);
        }
        if (count === 2) {
          expect(items).toBe(undefined);
          let item = new Item(goblin.getInventory()[0]);
          expect(item.getDescription()).toBe("chainmail");
          bot.client.wearItem(theArmour);
        }
      }
      if (event === EVENTS.message && count >= 2) {
        expect(bot.messages.pop()).toEqual('You are wearing the chainmail.');
        count++;
      }

      if (event === EVENTS.update && count < 2) {
        expect(goblin.getArmour()).toBe("");
      }

      if (event === EVENTS.update && count > 2) {
        expect(goblin.getArmour()).toBe("chainmail");
        expect(goblin.getAC()).toBe(7);
        count++;
      }

      if (count > 3) { bot.stop();done(); }
    });
  });

  it('should unwear an item', (done) => {
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
    let goblin = bot.client.getEntity();
    goblin.inventory = ["chainmail"];
    bot.start(defaultPos, (event) => {
      if (event === EVENTS.map) {
        bot.client.wearItem();
      }

      if (event === EVENTS.message) {
        expect(bot.messages.pop()).toEqual('You are not wearing anything now.');
        done();
      }
    });
  });

  it('should take and drop an item', (done) => {
    app.rogueServer.cave.addItem(defaultPos, chainmail);
    let theArmour = app.rogueServer.cave.getItemsAt(defaultPos)[0];
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
    let count = -1;
    bot.start(defaultPos, (event) => {
      if (event === EVENTS.map) {
        bot.client.takeItem(theArmour);
      }
      if (event === EVENTS.items) {
        count++;
        let goblin = bot.client.getEntity();
        let pos = goblin.pos;
        let items = bot.client.getItemsAt(pos.x, pos.y, pos.z);
        if (count === 1) {
          expect(items.length).toBe(1);
        }
        if (count === 2) {
          expect(items).toBe(undefined);
          let item = new Item(goblin.getInventory()[0]);
          expect(item.getDescription()).toBe("chainmail");
          bot.client.dropItem(theArmour);
        }
      }
      if (event === EVENTS.message && count >= 2) {
        expect(bot.messages.pop()).toEqual('You drop the chainmail.');
        count++;
      }
      if (count > 2) { bot.stop();done(); }
    });
  });
});