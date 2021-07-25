"use strict";

import path from 'path';
import { Matchers, MessageProviderPact  } from "@pact-foundation/pact";
const { like, term } = Matchers;

import EntityServer from '../src/server/entity-server';
import Rock from "../src/server/items/rock";
const rock = new Rock();


const defaultMapTemplate = {
  "width":4,
  "height":5,
  "gateways": "test_url"
};

const server = new EntityServer(null, defaultMapTemplate);
server.cave.addItem({x:1,y:1,z:0}, rock);
const entity = server.createEntity("mock", {});
entity.entrance =  {x:1,y:1,z:1};

const rogueClientApi = {
  getMap: () => {
    return new Promise((resolve, reject) => {
      resolve(server.getMap(entity));
    })
  },
  getPos: () => {
    return new Promise((resolve, reject) => {
      resolve(entity.getPos());
    });
  },
  getEntities: () => {
    return new Promise((resolve, reject) => {
      resolve(server.getEntities());
    });
  },
  getItems: () => {
    return new Promise((resolve, reject) => {
      resolve(server.getItemsForRoom({x:0, y:0, z:0}));
    });
  }
};

describe("Rogue message provider map tests", () => {
  // 2 Pact setup
  const pact = new MessageProviderPact({
    messageProviders: {
      "a position event": () => rogueClientApi.getPos(),
      "a map event": () => rogueClientApi.getMap(),
      "an entities event": () => rogueClientApi.getEntities(),
      "an items event": () => rogueClientApi.getItems()
    },
    provider: "RogueServerMessageProvider",
    providerVersion: "1.0.0",
    pactUrls: [
      path.resolve(
        process.cwd(),
        "pacts",
        "rogueclientmessageconsumer-rogueservermessageprovider.json"
      ),
    ],
  });

  // 3 Verify the interactions
  describe("Rogue API", () => {
    it("sends a valid map", () => {
      return pact.verify();
    })
  });
});