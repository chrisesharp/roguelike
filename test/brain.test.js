"use strict";

import GoblinBrain from "../src/monsters/goblin-brain";
import Cave from "../src/server/cave";
import Goblin from "../src/server/entities/goblin";
import Warrior from "../src/server/entities/warrior";
import Wizard from "../src/server/entities/wizard";
import { DIRS } from "../src/common/movement";

const defaultMap = {
    "width":4,
    "height":5,
  };

const warrior = new Warrior({pos:{x:2,y:2,z:0}});
const wizard = new Wizard({pos:{x:3,y:3,z:0}});
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

    test('should move south towards target', (done) => {
        let map = new Cave(defaultMap).getMap();
        let movement;
        let client = {
            getParticipant: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            entities: {"(2,2)": warrior, "(3,3)": wizard, "(0,0)": goblin },
            others: {"(2,2)": warrior, "(3,3)": wizard}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.currentTarget = warrior;
        brain.ready("position");
        expect(movement).toBe(DIRS.SOUTH);
        done();
    });

    test('should move east towards target', (done) => {
        let map = new Cave(defaultMap).getMap();
        const warrior = new Warrior({pos:{x:2,y:0,z:0}});
        let movement;
        let client = {
            getParticipant: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            entities: {"(2,0)": warrior, "(3,3)": wizard, "(0,0)": goblin },
            others: {"(2,0)": warrior, "(3,3)": wizard}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.currentTarget = warrior;
        brain.ready("position");
        expect(movement).toBe(DIRS.EAST);
        done();
    });

    test('should move north towards target', (done) => {
        let map = new Cave(defaultMap).getMap();
        const warrior = new Warrior({pos:{x:0,y:-1,z:0}});
        let movement;
        let client = {
            getParticipant: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            entities: {"(0,-1)": warrior, "(3,3)": wizard, "(0,0)": goblin },
            others: {"(0,-1)": warrior, "(3,3)": wizard}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.currentTarget = warrior;
        brain.ready("position");
        expect(movement).toBe(DIRS.NORTH);
        done();
    });

    test('should move west towards target', (done) => {
        let map = new Cave(defaultMap).getMap();
        const warrior = new Warrior({pos:{x:-1,y:0,z:0}});
        let movement;
        let client = {
            getParticipant: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            entities: {"(-1,0)": warrior, "(3,3)": wizard, "(0,0)": goblin },
            others: {"(-1,0)": warrior, "(3,3)": wizard}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.currentTarget = warrior;
        brain.ready("position");
        expect(movement).toBe(DIRS.WEST);
        done();
    });

    test('should not move without a target', (done) => {
        let map = new Cave(defaultMap).getMap();
        let movement;
        let client = {
            getParticipant: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            entities: {"(0,0)": goblin },
            others: {}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.currentTarget = null;
        brain.ready("position");
        expect(movement).toBe(undefined);
        done();
    });

    test('should not move when target below or above', (done) => {
        let map = new Cave(defaultMap).getMap();
        const warrior = new Warrior({pos:{x:0,y:0,z:1}});
        let movement;
        let client = {
            getParticipant: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            entities: {"(0,0)": warrior, "(3,3)": wizard, "(0,0)": goblin },
            others: {"(0,0)": warrior, "(3,3)": wizard}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.currentTarget = warrior;
        brain.ready("position");
        expect(movement).toBe(undefined);
        done();
    });

});