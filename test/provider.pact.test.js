import path from 'path';
import { Matchers, MessageProviderPact  } from "@pact-foundation/pact";
const { like, term } = Matchers;

import RogueServer from '../src/server/rogue-server';


const defaultMapTemplate = {
  "width":4,
  "height":5,
};

const server = new RogueServer(null, defaultMapTemplate);
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
  }
};

describe("Rogue message provider map tests", () => {
  // 2 Pact setup
  const pact = new MessageProviderPact({
    messageProviders: {
      "a position event": () => rogueClientApi.getPos(),
      "a map event": () => rogueClientApi.getMap()
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