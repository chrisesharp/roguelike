"use strict";

import http from "http";
import io from "socket.io";
import Server from "../src/server/rogue-server";
import GoblinBot from "../src/monsters/goblin-bot";
import { Tiles } from "../src/server/tile-server";
import { DIRS } from "../src/common/movement";
import Rock from "../src/server/items/rock";
import Dagger from "../src/server/items/dagger";
import Apple from "../src/server/items/apple";
import Chainmail from "../src/server/items/chainmail";
import Goblin from "../src/server/entities/goblin";

const rock = new Rock();
const dagger = new Dagger();
const apple = new Apple();
const chainmail = new Chainmail();

let httpServer;
let httpServerAddr;
let ioServer;
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
  ioServer = io(httpServer);
  app = new Server(ioServer, defaultMap);
  ioServer.on("connection",(socket)=> {
    app.connection(socket);
  });
  done();
});

afterEach((done) => {
  ioServer.close();
  httpServer.close();
  app = null;
  ioServer = null;
  httpServer = null;
  done();
});


describe('monster connects to server', () => {

  test('should return default map', (done) => {
    app.cave.getMap().addTile(defaultPos.x,defaultPos.y,defaultPos.z, Tiles.stairsUpTile);
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
    bot.start(defaultPos, (event) => {
      if (event === 'map') {
        expect(bot.map.getWidth()).toBe(defaultMap.width);
        expect(bot.map.getHeight()).toBe(defaultMap.height);
        expect(bot.map.getTile(defaultPos.x, defaultPos.y, defaultPos.z)).toEqual(Tiles.stairsUpTile);
        expect(bot.map.getTile(-1,-1,-1)).toEqual(Tiles.nullTile);
        bot.stop();
        done();
      }
    });    
  });

  test('should see items ', (done) => {
    app.cave.getMap().addTile(defaultPos.x,defaultPos.y,defaultPos.z, Tiles.stairsUpTile);
    let pos = {x:defaultPos.x, y:defaultPos.y+1, z:defaultPos.z};
    app.cave.addItem(pos, dagger);
    app.cave.addItem(pos, rock);
    let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
    bot.start(defaultPos, (event) => {
      if (event === 'items') {
        bot.move(DIRS.SOUTH);
      } else if (event == 'message') {
        expect(bot.messages.pop()).toBe("There are several objects here.");
        bot.stop();
        done();
      }
    });    
  });

  test('should see other entities', (done) => {
    let pos = {x:defaultPos.x, y:defaultPos.y+1, z:defaultPos.z};
    let bot1 = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
    let bot2 = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
    bot1.start(pos, () => {
      bot2.start(defaultPos, (event) => {
        if (event === 'message') {
          expect(bot1.messages[0]).toBe("Gobldigook just entered this cave.");
        }
        if (event === 'entities') {
          let goblin = bot1.participant.getParticipant();
          let pos = goblin.pos;
          let entity = bot2.participant.getEntityAt(pos.x, pos.y, pos.z);
          expect(entity.getGlyph().getChar()).toEqual("&");
          bot2.stop();
          bot1.stop();
          done();
        }
      }); 
    });
  });

  // test('should take item', (done) => {
  //   app.cave.addItem(defaultPos, dagger);
  //   let theDagger = app.cave.getItemsAt(defaultPos)[0];
  //   let bot = new GoblinBot(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
  //   bot.start(defaultPos, (event) => {
  //     if (event === 'map') {
  //       bot.participant.takeItem(theDagger);
  //       bot.participant.wieldItem(theDagger);
  //     }
  //     if (event === 'items') {
  //       let goblin = bot.participant.getParticipant();
  //       let pos = goblin.pos;
  //       console.log("pos:",pos);
  //       let items = bot.participant.getItemsAt(pos.x, pos.y, pos.z);
  //       console.log("items:",items);
  //       expect(items.length).toBe(2);
  //       bot.stop();
  //       done();
  //     }
  //   });
  // });
});