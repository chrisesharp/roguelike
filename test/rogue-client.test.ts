/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/no-done-callback */
import * as http from "http";
import  * as Tiles from "../dist/server/server-tiles";
import { ConnectionServer } from "../dist/server/connection-server";
import { GoblinBot } from "../dist/monsters/goblin-bot";
import { OrcBot } from "../dist/monsters/orc-bot";
import { DIRS, Location } from "../dist/common/movement";
import { EVENTS } from "../dist/common/events";
import { Rock } from "../dist/server/items/rock";
import { Dagger } from "../dist/server/items/dagger";
import { Apple } from "../dist/server/items/apple";
import { Chainmail } from "../dist/server/items/chainmail";
import { Item } from "../dist/common/item";
import { Brain } from "../dist/monsters/brain";
import { Entity } from "../dist/common/entity";
import { GameMap } from "../dist/common/map";
import { AddressInfo } from "net";

const rock = new Rock();
const dagger = new Dagger();
const apple = new Apple();
const chainmail = new Chainmail();

let httpServer:http.Server;
let httpServerAddr:string|AddressInfo|null;
let app:ConnectionServer;
const defaultPos = {"x":2,"y":2,"z":0};

const defaultMap = {
  "width":4,
  "height":5,
  "depth":3,
  "entrance": {"x":0,"y":0,"z":0},
  "gateway": "test_url"
};

const nullMap = new GameMap({
  "width":0,
  "height":0,
  "depth":0,
});

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
  app.entityServer.resetState();
  httpServer.close();
  done();
});

class TestBrain extends Brain {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  readyFn:(event: string, data?: unknown)=>void = (event: string, data?: unknown) => {
    //noop
  }
  setTarget(target:Entity|undefined): void { this.currentTarget = target; }

  setReadyFn(fn:(event: string, data?: unknown)=>void):void {
    this.readyFn = fn;
  }
  ready(event: string, data?: unknown): void {
    this.readyFn(event, data);
  }
}

describe('monster connects to server', () => {
  // eslint-disable-next-line jest/expect-expect
  it('should use supplied brain', (done) => {
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : httpServerAddr;
    const bot = new GoblinBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mockBrain.setReadyFn((event:string) => {
      bot.stop();
      done();
    });
    bot.setBrain(mockBrain);
    
    bot.startBot();
  });

  it('should reconnect if reset', (done) => {
    let resetReceived = false;
    const httpServer2 = http.createServer();
    const httpServerAddr2 = httpServer2.listen().address();
    const app2 = new ConnectionServer(httpServer2, defaultMap);
    const addr:string = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const addr2:string = (typeof httpServerAddr2 === 'object') ? `http://[${httpServerAddr2?.address}]:${httpServerAddr2?.port}` : `${httpServer2}`;
    const bot = new GoblinBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    mockBrain.setReadyFn((event:string)=>{ 
        if (event == EVENTS.reset && !resetReceived) {
          expect(app2.entityServer.getEntities().length).toBe(0); resetReceived = true;
        }
        if (event == EVENTS.map && resetReceived) {
          expect(app.entityServer.getEntities().length).toBe(0); 
          expect(app2.entityServer.getEntities().length).toBe(1); 
          app2.stop(); 
          httpServer2.close();
          bot.stop();
          done();
        }
      });
    bot.setBrain(mockBrain);
    
    bot.startBot({
      callback: ()=> {
        expect(app.entityServer.getEntities().length).toBe(1); 
        app.reset({url:addr2});
      }
    });
  });

  it('should reconnect if relocated', (done) => {
    let resetReceived = false;
    const httpServer2 = http.createServer();
    const httpServerAddr2 = httpServer2.listen().address();
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const addr2 = (typeof httpServerAddr2 === 'object') ? `http://[${httpServerAddr2?.address}]:${httpServerAddr2?.port}` : `${httpServer2}`;
    const app2 = new ConnectionServer(httpServer2, defaultMap);
    const bot = new GoblinBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    mockBrain.setReadyFn((event:string)=>{ 
      if (event == EVENTS.reset && !resetReceived) {
        resetReceived = true;
        expect(app2.entityServer.getEntities().length).toBe(0); 
      }
      if (event == EVENTS.map && resetReceived) {
        expect(app.entityServer.getEntities().length).toBe(0); 
        expect(app2.entityServer.getEntities().length).toBe(1); 
        bot.stop();
        app2.stop(); 
        httpServer2.close(); 
        done();}
    });
    bot.setBrain(mockBrain);
    
    bot.startBot({
      callback: async ()=> {
        expect(app.entityServer.getEntities().length).toBe(1); 
        app.reset({url:addr2});
      }
    });
  });

  it('should use supplied brain as orc', (done) => {
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot = new OrcBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mockBrain.setReadyFn((event:string) => { 
        bot.stop();
        done();
    });
    bot.setBrain(mockBrain);
    
    bot.startBot({
      callback: async ()=> {
        expect(app.entityServer.getEntities().length).toBe(1); 
      }
    });
  });

  it('should get an entrance on specified level for type', (done) => {
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot = new OrcBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mockBrain.setReadyFn((event:string, data:unknown)=>{ 
      if (event === EVENTS.position) {
        if (typeof data === "object") {
          const posData = data as {id:string,pos:Location};
          expect(posData.pos?.z).toBe(1);
        }
        bot.stop(); 
        done();
      }
    });
    bot.setBrain(mockBrain);
    
    bot.startBot({
      callback: () => {
        bot.move(DIRS.SOUTH);
        bot.move(DIRS.NORTH);
      }
    });
  });

  it('should get pings', (done) => {
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot = new GoblinBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    mockBrain.setReadyFn((event) => { 
      if (event === EVENTS.ping) {
        expect(event).toBe(EVENTS.ping); 
        bot.stop(); 
        done();
      }
    });
    bot.setBrain(mockBrain);
    
    bot.startBot();
  });

  it('should return default map', (done) => {
    app.entityServer.cave.getMap().addTile(defaultPos.x,defaultPos.y,defaultPos.z, Tiles.stairsUpTile);
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot = new GoblinBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    mockBrain.setReadyFn((event:string) => {
      if (event === EVENTS.map) {
        expect(bot.getBrain()?.getMap().getWidth()).toBe(defaultMap.width);
        expect(bot.getBrain()?.getMap().getHeight()).toBe(defaultMap.height);
        expect(bot.getBrain()?.getMap().getEntrance()).toEqual(defaultPos);
        expect(bot.getBrain()?.getMap().getTile(defaultPos.x, defaultPos.y, defaultPos.z)).toEqual(Tiles.stairsUpTile);
        expect(bot.getBrain()?.getMap().getTile(-1,-1,-1)).toEqual(Tiles.nullTile);
        bot.stop();
        done();
      }
    });
    bot.setBrain(mockBrain);
    
    bot.startBot({startPos:defaultPos});    
  });

  it('should move',  (done) => {
    const newPos = {x:defaultPos.x, y:defaultPos.y+1, z:defaultPos.z};
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot = new GoblinBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    mockBrain.setReadyFn((event:string) => {
      if (event === EVENTS.map) {
        bot.move(DIRS.SOUTH);
      }
      if (event == EVENTS.position) {
        expect(bot.getClient().getEntity().getPos()).toEqual(newPos);
        bot.stop();
        done();
      }
    });
    bot.setBrain(mockBrain);
    
    bot.startBot({startPos:defaultPos});    
  });

  it('should see items', (done) => {
    const pos = {x:defaultPos.x, y:defaultPos.y + 1, z:defaultPos.z};
    app.entityServer.cave.addItem(pos, dagger);
    app.entityServer.cave.addItem(pos, rock);
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot = new GoblinBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    mockBrain.setReadyFn((event:string) => {
      const goblin = bot.getClient().getEntity();
      if (event === EVENTS.items) {
        bot.move(DIRS.SOUTH);
      } else if (event == EVENTS.message) {
        const messages:string[] = bot.getMessages();
        expect(messages.pop()).toBe("There are several objects here.");
        expect(goblin.getSightRadius()).toBe(20);
        bot.stop();
        done();
      }
    });
    bot.setBrain(mockBrain);
    
    bot.startBot({startPos:defaultPos});
  });

  it('should see new items changing rooms', (done) => {
    let descended = false;
    app.entityServer.cave.getMap().addTile(defaultPos.x, defaultPos.y, defaultPos.z, Tiles.stairsDownTile);
    const pos = {x:defaultPos.x, y:defaultPos.y, z:defaultPos.z + 1};
    app.entityServer.cave.addItem(pos, dagger);
    app.entityServer.cave.addItem(pos, rock);
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot = new GoblinBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    mockBrain.setReadyFn((event:string) => {
      if (event === EVENTS.map) {
        bot.move(DIRS.DOWN);
      }

      if (event === EVENTS.message) {
        expect(bot.getMessages().pop()).toBe("You descend to level 1!");
      }

      if (event === EVENTS.position) {
        if (bot.getClient().getEntity().getPos().z === pos.z) {
          descended = true;
        }
      }
      if (event === EVENTS.items && descended) {
        expect(bot.getClient().getItemsAt(pos.x, pos.y, pos.z).length).toBe(2);
        bot.stop();
        done();
      }
    });
    bot.setBrain(mockBrain);
    
    bot.startBot({startPos:defaultPos});
  });

  it('should teleport when passing gateway', (done) => {
    let moved = false;
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot = new GoblinBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    mockBrain.setReadyFn((event:string) => {
      if (event === EVENTS.map) {
        bot.move(DIRS.NORTH);
        moved = true
      }

      if (moved && event === EVENTS.message) {
        expect(bot.getMessages().pop()).toBe("Your world spins as you are teleported to somewhere else!");
      }

      if (moved && event === EVENTS.reconnect) {
        bot.stop();
        done();
      }
    });
    bot.setBrain(mockBrain);
    
    const pos = app.entityServer.cave.getGatewayPositions()[0][0];
    bot.startBot({startPos:{x:pos.x, y:pos.y + 1, z:pos.z}});
  });

  it('should see other entities', (done) => {
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot1 = new GoblinBot(addr);
    const mockBrain1 = new TestBrain(nullMap, bot1.getClient(),"");
    bot1.setBrain(mockBrain1);
    const bot2 = new GoblinBot(addr);
    const mockBrain2 = new TestBrain(nullMap, bot2.getClient(),"");
    mockBrain2.setReadyFn((event:string) => {
      if (event === EVENTS.message) {
        expect(bot1.getMessages()[0]).toBe("a goblin just entered this cave.");
      }
      if (event === EVENTS.entities) {
        const goblin = bot1.getClient().getEntity();
        const pos = goblin.getPos();
        const entity = bot2.getClient().getEntityAt(pos.x, pos.y, pos.z);
        expect(entity?.getChar()).toEqual("&");
        bot1.stop();
        bot2.stop();
        done();
      }
    });
    bot2.setBrain(mockBrain2);
    
    const pos = {x:defaultPos.x, y:defaultPos.y + 1, z:defaultPos.z};
    bot1.startBot({startPos:pos, callback: () => {
        bot2.startBot({startPos:defaultPos}); 
    }});
  });

  it('should refresh existing entities', (done) => {
    let count = 0;
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot1 = new GoblinBot(addr);
    const mockBrain1 = new TestBrain(nullMap, bot1.getClient(),"");
    bot1.setBrain(mockBrain1);
    const bot2 = new GoblinBot(addr);
    const mockBrain2 = new TestBrain(nullMap, bot2.getClient(),"");
    mockBrain2.setReadyFn((event:string) => {
      if (count < 1 && event === EVENTS.entities) {
        count++;
        return;
      }
      if (count == 1  && event === EVENTS.entities) {
        const entity = bot2.getClient().getEntityAt(pos.x, pos.y, pos.z);
        expect(entity?.getChar()).toEqual("&");
        bot1.stop();
        bot2.stop();
        done();
      }
    });
    bot2.setBrain(mockBrain2);
    
    const pos = {x:defaultPos.x, y:defaultPos.y + 1, z:defaultPos.z};
    bot1.startBot({startPos:pos, callback: () => {
        bot2.startBot({startPos:defaultPos, callback: () => {
          bot2.getClient().sync();
        }});
    }});
  });

  it('should refresh entities if out of sync', (done) => {
    const pos = {x:defaultPos.x + 1, y:defaultPos.y, z:defaultPos.z};
    const proto = {name:"Tester", role:"mock", type:"npc", hp:0, pos:pos};
    let count = 0;
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot = new GoblinBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    mockBrain.setReadyFn( (event:string) => {
      if (event === EVENTS.map) {
        app.entityServer.entities.addEntity("mock", proto);
        app.entityServer.getMessaging().sendToAll("position",{id:"mock", pos:pos});
      }
      if (event === EVENTS.entities) {
        if (count) {
          const entity = bot.getClient().getEntityAt(pos.x, pos.y, pos.z);
          expect(entity?.getPos()).toEqual(pos);
          bot.stop();
          done();
        }
        count++;
      }
    });
    bot.setBrain(mockBrain);
    
    bot.startBot({startPos:defaultPos}); 
  });

  it('should die', (done) => {
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot = new GoblinBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    mockBrain.setReadyFn( (event:string) => {
      if (event === EVENTS.map) {
        expect(bot.getClient().getEntity().isAlive()).toBe(true);
        const goblin = app.entityServer.entities.getEntityAt(defaultPos);
        goblin?.hitFor(10);
      }
      if (event === EVENTS.dead) {
        expect(bot.getClient().getEntity().isAlive()).toBe(false);
        bot.stop();
        done();
      }
    });
    bot.setBrain(mockBrain);
    
    bot.startBot({startPos:defaultPos});
  });

  it('should see other entities move', (done) => {
    const pos1 = {x:defaultPos.x + 1, y:defaultPos.y, z:defaultPos.z};
    const pos2 = {x:defaultPos.x + 1, y:defaultPos.y + 2, z:defaultPos.z};
    let bot2moved = false;
    let bot2started = false;
    let movecount = 0;
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot1 = new GoblinBot(addr);
    const mockBrain1 = new TestBrain(nullMap, bot1.getClient(),"");
    mockBrain1.setReadyFn( (event:string) => {
      if (!bot2started) {
        bot2started = true;
        bot2.startBot({startPos:pos1});
      }
      
      if (event === EVENTS.position) {
        if (movecount == 0) {
          bot2.move(DIRS.SOUTH);
        }
        if (movecount == 1) {
          const other = bot1.getClient().getEntityAt(pos2.x, pos2.y, pos2.z);
          const others = bot1.getClient().getOtherEntities();
          expect(others[0]).toEqual(other);
          expect(other?.getDescription()).toEqual(bot2.getClient().getEntity().getDescription());
          bot1.stop();
          bot2.stop();
          done();
        }
        movecount++;
      }
    });
    bot1.setBrain(mockBrain1);
    const bot2 = new GoblinBot(addr);
    const mockBrain2 = new TestBrain(nullMap, bot2.getClient(),"");
    mockBrain2.setReadyFn( (event:string) => {
      if (event === EVENTS.map && !bot2moved) {
        bot2moved = true;
        bot2.move(DIRS.SOUTH);
      }
    });
    bot2.setBrain(mockBrain2);
    
    bot1.startBot({startPos:defaultPos});
  });

  it('should see other entities die', (done) => {
    let bot2started = false;
    const pos1 = {x:defaultPos.x + 1, y:defaultPos.y, z:defaultPos.z};
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot1 = new GoblinBot(addr);
    const mockBrain1 = new TestBrain(nullMap, bot1.getClient(),"");
    mockBrain1.setReadyFn( (event:string) => {
      if (!bot2started) {
        bot2started = true;
        bot2.startBot({startPos:pos1});
      }
      
      if (bot2started && event === EVENTS.delete) {
        const other = bot1.getClient().getItemsAt(pos1.x, pos1.y, pos1.z)[0];
        expect(other?.getDescription()).toEqual("goblin corpse");
        bot1.stop();
        done();
      }
    });
    bot1.setBrain(mockBrain1);
    const bot2 = new GoblinBot(addr);
    const mockBrain2 = new TestBrain(nullMap, bot2.getClient(),"");
    mockBrain2.setReadyFn( (event:string) => {
      if (event === EVENTS.map) {
        bot2.stop();
      }
    });
    bot2.setBrain(mockBrain2);

    bot1.startBot({startPos:defaultPos});
  });

  it('should take and wield item', (done) => {
    let count = 0;
    app.entityServer.cave.addItem(defaultPos, dagger);
    const items = app.entityServer.cave.getItemsAt(defaultPos.x, defaultPos.y, defaultPos.z);
    const theDagger = items[0];
    expect(theDagger?.isWieldable()).toBe(true);
    
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot = new GoblinBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    mockBrain.setReadyFn( (event:string) => {
      const goblin = bot.getClient().getEntity();
      if (event === EVENTS.map) {
        if (theDagger) bot.getClient().takeItem(theDagger);
      }
      if (event === EVENTS.items) {
        count++;
        const pos = goblin.getPos();
        const items = bot.getClient().getItemsAt(pos.x, pos.y, pos.z);
        if (count === 1) {
          expect(items.length).toBe(1);
        }
        if (count === 2) {
          expect(items).toStrictEqual([]);
          const item = new Item(goblin.getInventory()[0].serialize());
          expect(item.getDescription()).toBe("dagger");
          bot.getClient().wieldItem(theDagger);
        }
      }
      if (event === EVENTS.message && count >= 2) {
        expect(bot.getMessages().pop()).toEqual('You are wielding the dagger.');
        count++;
      }

      if (event === EVENTS.update && count < 2) {
        expect(goblin.getWeapon()).toBe("");
      }

      if (event === EVENTS.update && count > 2) {
        expect(goblin.getWeapon()).toBe("dagger");
        count++;
      }
      if (count > 3) { 
        bot.stop();
        done();
      }
    });
    bot.setBrain(mockBrain);
    
    bot.startBot({startPos:defaultPos});
  });

  it('should unwield an item', (done) => {
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot = new GoblinBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    mockBrain.setReadyFn( (event:string) => {
      if (event === EVENTS.map) {
        bot.getClient().wieldItem();
      }

      if (event === EVENTS.message) {
        expect(bot.getMessages().pop()).toEqual('You are not wielding anything now.');
        const goblin = bot.getClient().getEntity();
        goblin.inventory.pop();
        bot.stop();
        done();
      }
    });
    bot.setBrain(mockBrain);
    const goblin = bot.getClient().getEntity();
    goblin.inventory = [dagger];
    
    bot.startBot({startPos:defaultPos});
  });

  it('should take and eat item', (done) => {
    app.entityServer.cave.addItem(defaultPos, apple);
    const theApple = app.entityServer.cave.getItemsAt(defaultPos.x, defaultPos.y, defaultPos.z)[0];
    expect(theApple.isEdible()).toBe(true);
    let count = 0;
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot = new GoblinBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    mockBrain.setReadyFn( (event:string) => {
      if (event === EVENTS.map) {
        bot.getClient().takeItem(theApple);
      }
      if (event === EVENTS.items) {
        count++;
        const goblin = bot.getClient().getEntity();
        const pos = goblin.getPos();
        const items = bot.getClient().getItemsAt(pos.x, pos.y, pos.z);
        if (count === 1) {
          expect(items.length).toBe(1);
        }
        if (count === 2) {
          expect(items).toStrictEqual([]);
          const item = new Item(goblin.getInventory()[0].serialize());
          expect(item.getDescription()).toBe("apple");
          bot.getClient().eat(item);
        }
      }
      if (event === EVENTS.message && count >= 2) {
        expect(bot.getMessages().pop()).toEqual('You eat the apple.');
        count++;
      }
      if (count > 2) {
        bot.stop();
        done();
      }
    });
    bot.setBrain(mockBrain);
    
    bot.startBot({startPos:defaultPos});
  });

  it('should take and wear item', (done) => {
    app.entityServer.cave.addItem(defaultPos, chainmail);
    const theArmour = app.entityServer.cave.getItemsAt(defaultPos.x, defaultPos.y, defaultPos.z)[0];
    expect(theArmour.isWearable()).toBe(true);
    let count = 0;
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot = new GoblinBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    mockBrain.setReadyFn( (event:string) => {
      const goblin = bot.getClient().getEntity();
      if (event === EVENTS.map) {
        bot.getClient().takeItem(theArmour);
      }
      if (event === EVENTS.items) {
        count++;
        const pos = goblin.getPos();
        const items = bot.getClient().getItemsAt(pos.x, pos.y, pos.z);
        if (count === 1) {
          expect(items.length).toBe(1);
        }
        if (count === 2) {
          expect(items).toStrictEqual([]);
          const item = new Item(goblin.getInventory()[0].serialize());
          expect(item.getDescription()).toBe("chainmail");
          bot.getClient().wearItem(item);
        }
      }
      if (event === EVENTS.message && count >= 2) {
        expect(bot.getMessages().pop()).toEqual('You are wearing the chainmail.');
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

      if (count > 3) { 
        bot.stop();
        done();
      }
    });
    bot.setBrain(mockBrain);
    
    bot.startBot({startPos:defaultPos});
  });

  it('should unwear an item', (done) => {
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot = new GoblinBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    mockBrain.setReadyFn( (event:string) => {
      if (event === EVENTS.map) {
        bot.getClient().wearItem();
      }

      if (event === EVENTS.message) {
        expect(bot.getMessages().pop()).toEqual('You are not wearing anything now.');
        const goblin = bot.getClient().getEntity();
        goblin.inventory.pop();
        bot.stop();
        done();
      }
    });
    bot.setBrain(mockBrain);
    const goblin = bot.getClient().getEntity();
    goblin.inventory = [chainmail];
    
    bot.startBot({startPos:defaultPos});
  });

  it('should take and drop an item', (done) => {
    app.entityServer.cave.addItem(defaultPos, chainmail);
    const theArmour = app.entityServer.cave.getItemsAt(defaultPos.x,defaultPos.y, defaultPos.z)[0];
    let count = 0;
    const addr = (typeof httpServerAddr === 'object') ? `http://[${httpServerAddr?.address}]:${httpServerAddr?.port}` : `${httpServerAddr}`;
    const bot = new GoblinBot(addr);
    const mockBrain = new TestBrain(nullMap, bot.getClient(),"");
    mockBrain.setReadyFn( (event:string) => {
      if (event === EVENTS.map) {
        bot.getClient().takeItem(theArmour);
      }
      if (event === EVENTS.items) {
        count++;
        const goblin = bot.getClient().getEntity();
        const pos = goblin.getPos();
        const items = bot.getClient().getItemsAt(pos.x, pos.y, pos.z);
        if (count === 1) {
          expect(items.length).toBe(1);
        }
        if (count === 2) {
          expect(items).toStrictEqual([]);
          const item = new Item(goblin.getInventory()[0].serialize());
          expect(item.getDescription()).toBe("chainmail");
          bot.getClient().dropItem(item);
        }
      }
      if (event === EVENTS.message && count >= 2) {
        expect(bot.getMessages().pop()).toEqual('You drop the chainmail.');
        count++;
      }
      if (count > 2) { 
        bot.stop();
        done();
      }
    });
    bot.setBrain(mockBrain);
    
    bot.startBot({startPos:defaultPos});
  });
});