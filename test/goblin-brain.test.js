"use strict";

import GoblinBrain from "../src/monsters/goblin-brain";
import Goblin from "../src/server/entities/goblin";
import Warrior from "../src/server/entities/warrior";
import Wizard from "../src/server/entities/wizard";
import { DIRS } from "../src/common/movement";
import { Tiles } from "../src/server/tile-server";

const mockMap = {
    "width":10,
    "height":10,
    "getTile": () => {return Tiles.floorTile;}
  };

const warrior = new Warrior({pos:{x:4,y:4,z:0}});
const wizard = new Wizard({pos:{x:5,y:5,z:0}});
const goblin = new Goblin({pos:{x:2,y:2,z:0}});

describe('goblin brain responses', () => {
    test('should identify targets', (done) => {
        let map = mockMap;
        let client = {
            getParticipant: () => { return goblin;},
            entities: {"(4,4)": warrior, "(2,2)": goblin },
            others: {"1": warrior}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.ready("entities");
        expect(brain.getCurrentTarget()).toEqual(warrior);
        done();
    });

    test('should ignore other goblins', (done) => {
        let otherGoblin = new Goblin({pos:{x:4,y:4,z:0}});
        let map = mockMap;
        let client = {
            getParticipant: () => { return goblin;},
            entities: {"(4,4)": otherGoblin, "(2,2)": goblin },
            others: {"1": otherGoblin}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.ready("entities");
        expect(brain.getCurrentTarget()).toEqual(undefined);
        done();
    });

    test('should identify closest target', (done) => {
        let map = mockMap;
        let client = {
            getParticipant: () => { return goblin;},
            entities: {"(4,4)": warrior, "(5,5)": wizard, "(2,2)": goblin },
            others: {"1": warrior, "2": wizard}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.ready("entities");
        expect(brain.getCurrentTarget()).toEqual(warrior);
        done();
    });

    test('should move south towards target', (done) => {
        let map = mockMap;
        let movement;
        let client = {
            getParticipant: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            entities: {"(4,4)": warrior, "(5,5)": wizard, "(2,2)": goblin },
            others: {"1": warrior, "2": wizard}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.currentTarget = warrior;
        brain.ready("position", "1");
        brain.ready("ping");
        expect(movement).toBe(DIRS.SOUTH);
        done();
    });

    test('should move east towards target', (done) => {
        let map = mockMap;
        const warrior = new Warrior({pos:{x:4,y:2,z:0}});
        let movement;
        let client = {
            getParticipant: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            entities: {"(4,2)": warrior, "(5,5)": wizard, "(2,2)": goblin },
            others: {"1": warrior, "2": wizard}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.currentTarget = warrior;
        brain.ready("position", "1");
        brain.ready("ping");
        expect(movement).toBe(DIRS.EAST);
        done();
    });

    test('should move north towards target', (done) => {
        let map = mockMap;
        const warrior = new Warrior({pos:{x:2,y:0,z:0}});
        let movement;
        let client = {
            getParticipant: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            entities: {"(2,0)": warrior, "(5,5)": wizard, "(2,2)": goblin },
            others: {"1": warrior, "2": wizard}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.currentTarget = warrior;
        brain.ready("position", "1");
        brain.ready("ping");
        expect(movement).toBe(DIRS.NORTH);
        done();
    });

    test('should move west towards target', (done) => {
        let map = mockMap;
        const warrior = new Warrior({pos:{x:0,y:2,z:0}});
        let movement;
        let client = {
            getParticipant: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            entities: {"(0,2)": warrior, "(5,5)": wizard, "(2,2)": goblin },
            others: {"1": warrior, "2": wizard}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.currentTarget = warrior;
        brain.ready("position", "1");
        brain.ready("ping");
        expect(movement).toBe(DIRS.WEST);
        done();
    });

    test('should move try opposite direction if cant get to target', (done) => {
        let map = {
            "width":10,
            "height":10,
            "getTile": (x,y,z) => { return (x==goblin.pos.x+1) ? Tiles.floorTile : Tiles.wallTile;}
          };
        const warrior = new Warrior({pos:{x:0,y:2,z:0}});
        let movement;
        let client = {
            getParticipant: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            entities: {"(0,2)": warrior, "(5,5)": wizard, "(2,2)": goblin },
            others: {"1": warrior, "2": wizard}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.currentTarget = warrior;
        brain.ready("position", "1");
        brain.ready("ping");
        expect(movement).toBe(DIRS.EAST);
        done();
    });

    test('should not move if boxed in', (done) => {
        let map = {
            "width":10,
            "height":10,
            "getTile": (x,y,z) => { return  Tiles.wallTile;}
          };
        const warrior = new Warrior({pos:{x:0,y:2,z:0}});
        let movement;
        let client = {
            getParticipant: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            entities: {"(0,2)": warrior, "(5,5)": wizard, "(2,2)": goblin },
            others: {"1": warrior, "2": wizard}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.currentTarget = warrior;
        brain.ready("position", "1");
        brain.ready("ping");
        expect(movement).toBe(undefined);
        done();
    });

    test('should not move without a target', (done) => {
        let map = mockMap;
        let movement;
        let client = {
            getParticipant: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            entities: {"(0,0)": goblin },
            others: {}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.currentTarget = null;
        brain.ready("position", "1");
        brain.ready("ping");
        expect(movement).toBe(undefined);
        done();
    });

    test('should not move when target below or above', (done) => {
        let map = mockMap;
        const warrior = new Warrior({pos:{x:0,y:0,z:1}});
        let movement;
        let client = {
            getParticipant: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            entities: {"(0,0)": warrior, "(3,3)": wizard, "(0,0)": goblin },
            others: {"1": warrior, "2": wizard}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.currentTarget = warrior;
        brain.ready("position");
        brain.ready("ping");
        expect(movement).toBe(undefined);
        done();
    });

    test('should disconnect if dead', (done) => {
        let disconnected = false;
        let client = {
            getParticipant: () => { return goblin;},
            entities: {"(0,0)": goblin },
            others: {},
            disconnectFromServer: () => {disconnected = true;}
        };
        let messages = [];
        let brain = new GoblinBrain(null, client, messages);
        brain.speed = 0;
        brain.ready("dead");
        expect(disconnected).toBe(true);
        done();
    });

    test('should sync if delete received', (done) => {
        let synched = false;
        let client = {
            getParticipant: () => { return goblin;},
            entities: {"(0,0)": goblin },
            others: {},
            sync: () => {synched = true;}
        };
        let messages = [];
        let brain = new GoblinBrain(null, client, messages);
        brain.speed = 0;
        brain.ready("delete");
        expect(synched).toBe(true);
        done();
    });

    test('should sync if no target for 10 turns', (done) => {
        let synched = false;
        let client = {
            getParticipant: () => { return goblin;},
            entities: {"(0,0)": goblin },
            others: {},
            sync: () => {synched = true;}
        };
        let messages = [];
        let brain = new GoblinBrain(null, client, messages);
        brain.speed = 0;
        brain.syncCount = 10;
        brain.ready("position","1");
        brain.ready("ping");
        expect(synched).toBe(true);
        done();
    });
});