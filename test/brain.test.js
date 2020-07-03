"use strict";

import GoblinBrain from "../src/monsters/goblin-brain";
import Cave from "../src/server/cave";
import Goblin from "../src/server/entities/goblin";
import Warrior from "../src/server/entities/warrior";
import Wizard from "../src/server/entities/wizard";

const defaultMap = {
    "width":4,
    "height":5,
  };

const warrior = new Warrior({pos:{x:3,y:3,z:0}});
const wizard = new Wizard({pos:{x:2,y:2,z:0}});
const goblin = new Goblin({pos:{x:0,y:0,z:0}});

describe('goblin brain responses', () => {
    test('should identify targets', (done) => {
        let map = new Cave(defaultMap).getMap();
        let client = {
            getParticipant: () => { return goblin;},
            entities: {"(2,2)": warrior, "(0,0)": goblin },
            others: {"(2,2)": warrior}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.ready("entities");
        expect(brain.getCurrentTarget()).toEqual(warrior);
        done();
    });

    test('should identify closest target', (done) => {
        let map = new Cave(defaultMap).getMap();
        let client = {
            getParticipant: () => { return goblin;},
            entities: {"(2,2)": warrior, "(3,3)": wizard, "(0,0)": goblin },
            others: {"(2,2)": warrior, "(3,3)": wizard}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.ready("entities");
        expect(brain.getCurrentTarget()).toEqual(warrior);
        done();
    });
});