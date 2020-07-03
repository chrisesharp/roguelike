"use strict";

import GoblinBrain from "../src/monsters/goblin-brain";
import Cave from "../src/server/cave";
import Goblin from "../src/server/entities/goblin";
import Warrior from "../src/server/entities/warrior";

const defaultMap = {
    "width":4,
    "height":5,
  };

const warrior = new Warrior({pos:{x:2,y:2,z:0}});
const goblin = new Goblin({pos:{x:0,y:0,z:0}});

describe('goblin brain responses', () => {
    test('should identify targets', (done) => {
        let map = new Cave(defaultMap).getMap();
        let client = {
            participant: goblin,
            entities: {"(2,2)": warrior, "(0,0)": goblin },
            others: {"(2,2)": warrior}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.ready("entities");
        expect(brain.getCurrentTarget()).toEqual(warrior);
        done();
    });
});