/**
 * @jest-environment node
 */
import path from 'path';
import { Tiles } from '../src/server/server-tiles';
import { EVENTS } from '../src/common/events';

import { Matchers, MessageConsumerPact, synchronousBodyHandler } from "@pact-foundation/pact";
const { like, eachLike } = Matchers;

const rogueClientAPIHandler = function (payload) {
  return;
}

const T = Tiles.nullTile;

describe("Rogue message consumer tests", () => {
    const clientMessagePact = new MessageConsumerPact({
      consumer: "RogueClientMessageConsumer",
      dir: path.resolve(process.cwd(), "pacts"),
      pactfileWriteMode: "update",
      provider: "RogueServerMessageProvider",
      logLevel: "info",
    });
  
    describe("receive a rogue server event", () => {
      it("accepts a valid map", () => {
        return clientMessagePact
          .given(`a ${EVENTS.getMap} event`)
          .expectsToReceive(`a ${EVENTS.map} event`)
          .withContent(like({
            width: 4,
            height: 5,
            depth: 2,
            tiles: [
              [ [T,T,T,T], [T,T,T,T], [T,T,T,T], [T,T,T,T], [T,T,T,T] ],
              [ [T,T,T,T], [T,T,T,T], [T,T,T,T], [T,T,T,T], [T,T,T,T] ]
            ],
            regions: [
              [ [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0] ],
              [ [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0] ]
            ],
            entrance: { x: 1, y: 3, z: 0 }
        }))
          .withMetadata({
            "content-type": "application/json",
          })
          .verify(synchronousBodyHandler(rogueClientAPIHandler));
      });

      it("accepts a valid position", () => {
        return clientMessagePact
          .given(`a ${EVENTS.getPosition} event`)
          .expectsToReceive(`a ${EVENTS.position} event`)
          .withContent(like({
            id: "mock",
            pos: { x: 1, y: 3, z: 0 }
        }))
          .withMetadata({
            "content-type": "application/json",
          })
          .verify(synchronousBodyHandler(rogueClientAPIHandler));
      });

      it("accepts a valid entities list", () => {
        return clientMessagePact
          .given(`a ${EVENTS.getEntities} event`)
          .expectsToReceive(`an ${EVENTS.entities} event`)
          .withContent(eachLike({
            char: "&",
            foreground:"green",
            background:"black",
            pos:{"x":1,"y":3,"z":0},
            name:"anonymous",
            details:"none",
            id:"mock",
            role:"goblin",
            entrance:{"x":1,"y":1,"z":1}
          }))
          .withMetadata({
            "content-type": "application/json",
          })
          .verify(synchronousBodyHandler(rogueClientAPIHandler));
      });

      it("accepts a valid items list", () => {
        return clientMessagePact
          .given(`a ${EVENTS.getItems} event`)
          .expectsToReceive(`an ${EVENTS.items} event`)
          .withContent(like({
            "(1,1,0)": eachLike({ 
                char: "*",
                foreground:"grey",
                background:"black",
                pos:{"x":1,"y":1,"z":0},
                name:"rock"
              })
          }))
          .withMetadata({
            "content-type": "application/json",
          })
          .verify(synchronousBodyHandler(rogueClientAPIHandler));
      });
    });
});