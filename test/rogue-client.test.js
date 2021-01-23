"use strict";

import http from "http";
import ConnectionServer from "../src/server/connection-server";
import GoblinBot from "../src/monsters/goblin-bot";
import OrcBot from "../src/monsters/orc-bot";
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
  "depth":3
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
  app = new ConnectionServer(httpServer, defaultMap);
  done();
});

afterEach((done) => {
  app.stop();
  app.entityServer.state = null;
  httpServer.close();
  app = null;
  httpServer = null;
  done();
});


describe('monster connects to server', () => {
  it('should use supplied brain', async (done) => {
    let mockBrain = {setMap: ()=>{}, ready: (event)=>{ bot.stop(); done();}};
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    bot.start();
  });

  it('should reconnect if reset', async (done) => {
    let httpServer2 = http.createServer();
    let httpServerAddr2 = httpServer2.listen().address();
    let app2 = new ConnectionServer(httpServer2, defaultMap);
    let resetReceived = false;
    let mockBrain = {setMap: ()=>{}, ready: (event)=>{ 
      if (event == EVENTS.reset && !resetReceived) {expect(app2.entityServer.getEntities().length).toBe(0); resetReceived = true; }
      if (event == EVENTS.map && resetReceived) { expect(app.entityServer.getEntities().length).toBe(0); expect(app2.entityServer.getEntities().length).toBe(1); app2.stop(); httpServer2.close(); done();}
    }};
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    bot.start(null, ()=> {
      expect(app.entityServer.getEntities().length).toBe(1); 
      app.reset({url:`http://[${httpServerAddr2.address}]:${httpServerAddr2.port}`});
    });
  });

  it('should use supplied brain as orc', async (done) => {
    let mockBrain = {ready: (event)=>{ bot.stop(); done();}};
    let bot = new OrcBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    bot.start();
  });

  it('should get an entrance on specified level for type', async (done) => {
    let mockBrain = {setMap: ()=>{}, ready: (event, data)=>{ 
      if (event === EVENTS.position) {
        expect(data.pos.z).toBe(1); bot.stop(); done();
      }
    }};
    let bot = new OrcBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    bot.start(null, () => {
      bot.move(DIRS.SOUTH);
      bot.move(DIRS.NORTH);
    });
  });

  it('should get pings', async (done) => {
    let mockBrain = {setMap: ()=>{}, ready: (event)=>{ if (event === EVENTS.ping) {expect(event).toBe(EVENTS.ping); bot.stop(); done();}}};
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    bot.start();
  });

  it('should return default map', async (done) => {
    app.entityServer.cave.getMap().addTile(defaultPos.x,defaultPos.y,defaultPos.z, Tiles.stairsUpTile);
    let mockBrain = {setMap: (map)=>{bot.brain.map = map;}, ready: (event) => {
      if (event === EVENTS.map) {
        expect(bot.brain.map.getWidth()).toBe(defaultMap.width);
        expect(bot.brain.map.getHeight()).toBe(defaultMap.height);
        expect(bot.brain.map.getTile(defaultPos.x, defaultPos.y, defaultPos.z)).toEqual(Tiles.stairsUpTile);
        expect(bot.brain.map.getTile(-1,-1,-1)).toEqual(Tiles.nullTile);
        bot.stop();
        done();
      }
    }};
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    bot.start(defaultPos);    
  });

  it('should move', async (done) => {
    let newPos = {x:defaultPos.x, y:defaultPos.y+1, z:defaultPos.z};
    let mockBrain = {setMap: (map)=>{bot.brain.map = map;}, ready: (event) => {
      if (event === EVENTS.map) {
        bot.move(DIRS.SOUTH);
      }
      if (event == EVENTS.position) {
        expect(bot.client.getEntity().pos).toEqual(newPos);
        bot.stop();
        done();
      }
    }};
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    bot.start(defaultPos);    
  });

  it('should see items ', async (done) => {
    let pos = {x:defaultPos.x, y:defaultPos.y+1, z:defaultPos.z};
    app.entityServer.cave.addItem(pos, dagger);
    app.entityServer.cave.addItem(pos, rock);
    let mockBrain = {setMap: (map)=>{bot.brain.map = map;}, ready: (event) => {
      let goblin = bot.client.getEntity();
      if (event === EVENTS.items) {
        bot.move(DIRS.SOUTH);
      } else if (event == EVENTS.message) {
        expect(bot.messages.pop()).toBe("There are several objects here.");
        expect(goblin.getSightRadius()).toBe(20);
        bot.stop();
        done();
      }
    }};
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    bot.start(defaultPos);
  });

  it('should see new items changing rooms ', async (done) => {
    app.entityServer.cave.getMap().addTile(defaultPos.x,defaultPos.y,defaultPos.z, Tiles.stairsDownTile);
    let pos = {x:defaultPos.x, y:defaultPos.y, z:defaultPos.z+1};
    app.entityServer.cave.addItem(pos, dagger);
    app.entityServer.cave.addItem(pos, rock);
    let mockBrain = {setMap: (map)=>{bot.brain.map = map;}, ready: (event) => {
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
    }};
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    let descended = false;
    bot.start(defaultPos);
  });

  it('should see other entities', async (done) => {
    let mockBrain1 = {ready: ()=>{ },setMap: ()=> {}};
    let mockBrain2 = {ready: (event) => {
      if (event === EVENTS.message) {
        expect(bot1.messages[0]).toBe("a goblin just entered this cave.");
      }
      if (event === EVENTS.entities) {
        let goblin = bot1.client.getEntity();
        let pos = goblin.pos;
        let entity = bot2.client.getEntityAt(pos.x, pos.y, pos.z);
        expect(entity.getGlyph().getChar()).toEqual("&");
        bot1.stop();
        bot2.stop();
        done();
      }
    },setMap: ()=> {}};
    let pos = {x:defaultPos.x, y:defaultPos.y+1, z:defaultPos.z};
    let bot1 = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain1);
    let bot2 = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain2);
    bot1.start(pos, () => {
        bot2.start(defaultPos); 
    });
  });

  it('should refresh existing entities', async (done) => {
    let mockBrain1 = {ready: ()=>{ },setMap: ()=> {}};
    let count = 0;
    let mockBrain2 = {ready: (event) => {
      if (count < 1 && event === EVENTS.entities) {
        count++;
        return;
      }
      if (count == 1  && event === EVENTS.entities) {
        let entity = bot2.client.getEntityAt(pos.x, pos.y, pos.z);
        expect(entity.getGlyph().getChar()).toEqual("&");
        bot1.stop();
        bot2.stop();
        done();
      }
    }, setMap: ()=> {}};

    let pos = {x:defaultPos.x, y:defaultPos.y+1, z:defaultPos.z};
    let bot1 = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain1);
    let bot2 = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain2);
    bot1.start(pos, () => {
        bot2.start(defaultPos, () => {
          bot2.client.sync();
        });
    });
  });

  it('should refresh entities if out of sync', async (done) => {
    let pos = {x:defaultPos.x+1, y:defaultPos.y, z:defaultPos.z};
    let proto = {name:"Tester", role:"mock", type:"npc", hp:0, pos:pos};
    let count = 0;
    let mockBrain = {setMap: (map)=>{bot.brain.map = map;}, ready: (event) => {
      if (event === EVENTS.map) {
        app.entityServer.entities.addEntity("mock", proto);
        app.entityServer.messaging.sendToAll("position",{id:"mock", pos:pos});
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
    }};
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    bot.start(defaultPos); 
  });

  it('should die', async (done) => {
    let mockBrain = {setMap: (map)=>{bot.brain.map = map;}, ready: (event) => {
      if (event === EVENTS.map) {
        expect(bot.client.getEntity().isAlive()).toBe(true);
        let goblin = app.entityServer.entities.getEntityAt(defaultPos);
        goblin.hitFor(10);
      }
      if (event === EVENTS.dead) {
        expect(bot.client.getEntity().isAlive()).toBe(false);
        bot.stop();
        done();
      }
    }};
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`,mockBrain);
    bot.start(defaultPos);
  });

  it('should see other entities move', async (done) => {
    let pos1 = {x:defaultPos.x+1, y:defaultPos.y, z:defaultPos.z};
    let pos2 = {x:defaultPos.x+1, y:defaultPos.y+2, z:defaultPos.z};
    let bot2moved = false;
    let bot2started = false;
    let movecount = 0;
    let mockBrain1 = {ready: (event) => {
      if (!bot2started) {
        bot2started = true;
        bot2.start(pos1);
      }
      
      if (event === EVENTS.position) {
        if (movecount == 0) {
          bot2.move(DIRS.SOUTH);
        }
        if (movecount == 1) {
          let other = bot1.client.getEntityAt(pos2.x, pos2.y, pos2.z);
          let others = bot1.client.getOtherEntities();
          expect(others[0]).toEqual(other);
          expect(other.getDescription()).toEqual(bot2.client.getEntity().getDescription());
          bot1.stop();
          bot2.stop();
          done();
        }
        movecount++;
      }
    }, setMap: ()=> {}};

    let mockBrain2 = {ready: (event) => {
      if (event === EVENTS.map && !bot2moved) {
        bot2moved = true;
        bot2.move(DIRS.SOUTH);
      }
    }, setMap: ()=> {}};

    let bot1 = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain1);
    let bot2 = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain2);
    bot1.start(defaultPos);
  });

  it('should see other entities die', async (done) => {
    let pos1 = {x:defaultPos.x+1, y:defaultPos.y, z:defaultPos.z};
    let mockBrain1 = {ready: (event) => {
      if (!bot2started) {
        bot2started = true;
        bot2.start(pos1);
      }
      
      if (event === EVENTS.delete) {
        let other = bot1.client.getItemsAt(pos1.x, pos1.y, pos1.z)[0];
        expect(other.getDescription()).toEqual("goblin corpse");
        bot1.stop();
        done();
      }
    }, setMap: ()=> {}};
    
    let mockBrain2 = {ready: (event) => {
      if (event === EVENTS.map) {
        bot2.stop();
      }
    }, setMap: ()=> {}};

    let bot1 = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain1);
    let bot2 = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain2);
    let bot2started = false;
    bot1.start(defaultPos);
  });

  it('should take and wield item', async (done) => {
    app.entityServer.cave.addItem(defaultPos, dagger);
    let theDagger = app.entityServer.cave.getItemsAt(defaultPos)[0];
    expect(theDagger.isWieldable()).toBe(true);
    let count = 0;
    let mockBrain = {ready: (event) => {
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
    }, setMap: (map)=> {bot.brain.map = map;}};

    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    bot.start(defaultPos);
  });

  it('should unwield an item', async (done) => {
    let mockBrain = {ready: (event) => {
      if (event === EVENTS.map) {
        bot.client.wieldItem();
      }

      if (event === EVENTS.message) {
        expect(bot.messages.pop()).toEqual('You are not wielding anything now.');
        bot.stop();
        done();
      }
    }, setMap: ()=> {}};

    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    let goblin = bot.client.getEntity();
    goblin.inventory = ["dagger"];
    bot.start(defaultPos);
  });

  it('should take and eat item', (done) => {
    app.entityServer.cave.addItem(defaultPos, apple);
    let theApple = app.entityServer.cave.getItemsAt(defaultPos)[0];
    expect(theApple.isEdible()).toBe(true);
    let count = 0;
    let mockBrain = {ready: (event) => {
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
    }, setMap: ()=> {}};

    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    bot.start(defaultPos);
  });

  it('should take and wear item', async (done) => {
    app.entityServer.cave.addItem(defaultPos, chainmail);
    let theArmour = app.entityServer.cave.getItemsAt(defaultPos)[0];
    expect(theArmour.isWearable()).toBe(true);
    let count = 0;
    let mockBrain = {ready: (event) => {
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
    }, setMap: ()=> {}};

    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    bot.start(defaultPos);
  });

  it('should unwear an item', async (done) => {
    let mockBrain = {ready: (event) => {
      if (event === EVENTS.map) {
        bot.client.wearItem();
      }

      if (event === EVENTS.message) {
        expect(bot.messages.pop()).toEqual('You are not wearing anything now.');
        bot.stop();
        done();
      }
    }, setMap: ()=> {}};

    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    let goblin = bot.client.getEntity();
    goblin.inventory = ["chainmail"];
    bot.start(defaultPos);
  });

  it('should take and drop an item', async (done) => {
    app.entityServer.cave.addItem(defaultPos, chainmail);
    let theArmour = app.entityServer.cave.getItemsAt(defaultPos)[0];
    let count = 0;
    let mockBrain = {ready: (event) => {
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
    }, setMap: ()=> {}};

    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, mockBrain);
    bot.start(defaultPos);
  });
});