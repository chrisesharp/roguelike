/**
 * @jest-environment node
 */
// import { pactWith } from 'jest-pact';
import path from 'path';
// import { healthRequest, healthyResponse } from "./pact.fixtures";
import { Matchers, MessageConsumerPact, synchronousBodyHandler } from "@pact-foundation/pact";
import { string } from '@pact-foundation/pact/dsl/matchers';
const { like, term } = Matchers;

function dogApiHandler(dog) {
    if (!dog.id && !dog.name && !dog.type) {
      throw new Error("missing fields")
    }
  
    // do some other things to dog...
    // e.g. dogRepository.save(dog)
    return
  }

describe("Rogue message consumer tests", () => {
    const messagePact = new MessageConsumerPact({
      consumer: "RogueMessageConsumer",
      dir: path.resolve(process.cwd(), "pacts"),
      pactfileWriteMode: "update",
      provider: "RogueMessageProvider",
      logLevel: "info",
    });
  
    describe("receive position event", () => {
      it("accepts a valid position", () => {
        return messagePact
          .given("some state")
          .expectsToReceive("an entity position")
          .withContent({
            id: string,
            pos: like({ x: 1, y:1, z:1 }),
            // pos: term({ generate: "bulldog", matcher: "^(bulldog|sheepdog)$" }),
          })
          .withMetadata({
            "content-type": "application/json",
          })
          .verify(synchronousBodyHandler(dogApiHandler))
      });
    });
});