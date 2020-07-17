import path from 'path';
import { Matchers, MessageProviderPact } from "@pact-foundation/pact";
const { like, term } = Matchers;

const dogApiClient = {
  createDog: () => {
    return new Promise((resolve, reject) => {
      resolve({
        id: "mock",
        pos: {x:1, y:2, z:1},
      })
    })
  }
};

describe("Rogue message provider tests", () => {
  // 2 Pact setup
  const pact = new MessageProviderPact({
    messageProviders: {
      "an entity position": () => dogApiClient.createDog(),
    },
    provider: "RogueMessageProvider",
    providerVersion: "1.0.0",
    pactUrls: [
      path.resolve(
        process.cwd(),
        "pacts",
        "roguemessageconsumer-roguemessageprovider.json"
      ),
    ],
  });

  // 3 Verify the interactions
  describe("Dog API RogueClient", () => {
    it("sends a valid dog", () => {
      return pact.verify()
    })
  });
});