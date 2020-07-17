/**
 * @jest-environment node
 */
// import { pactWith } from 'jest-pact';
import path from 'path';
// import { healthRequest, healthyResponse } from "./pact.fixtures";
import RogueServer from '../src/server/rogue-server';

import { Matchers, MessageConsumerPact, synchronousBodyHandler } from "@pact-foundation/pact";
import { string } from '@pact-foundation/pact/dsl/matchers';
const { like, term } = Matchers;

function entityApiHandler(dog) {
  if (!dog.pos) {
    throw new Error("missing fields")
  }
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
  
    describe("receive connection event", () => {
      it("accepts a valid connection", () => {
        return messagePact
          .given("no entities")
          .expectsToReceive("an entity")
          .withContent({
            pos: term({ generate: "bulldog", matcher: "^(bulldog|sheepdog)$" }),
          })
          .withMetadata({
            "content-type": "application/json",
          })
          .verify(synchronousBodyHandler(entityApiHandler))
      });
    });
});