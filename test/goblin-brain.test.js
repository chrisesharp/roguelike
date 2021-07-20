"use strict";

import GoblinBrain from "../src/monsters/goblin-brain";
import Goblin from "../src/server/entities/goblin";
import Warrior from "../src/server/entities/warrior";
import Wizard from "../src/server/entities/wizard";
import { DIRS } from "../src/common/movement";
import { EVENTS } from "../src/common/events";
import { Tiles } from "../src/server/server-tiles";

const mockMap = {
    "width":10,
    "height":10,
    "getTile": () => {return Tiles.floorTile;}
  };

const warrior = new Warrior({pos:{x:4,y:4,z:0}});
const wizard = new Wizard({pos:{x:5,y:5,z:0}});
const goblin = new Goblin({pos:{x:2,y:2,z:0}});

describe('goblin brain responses', () => {
    it('should identify targets', () => {
        let map = mockMap;
        let client = {
            getEntity: () => { return goblin;},
            getOtherEntities: () => { return [warrior];}
        };
        let messages = [];
        let brain = new GoblinBrain(null, client, messages);
        brain.setMap(map);
        brain.speed = 0;
        brain.ready(EVENTS.entities);
        expect(brain.getCurrentTarget()).toEqual(warrior);
    });

    it('should ignore other goblins', () => {
        let otherGoblin = new Goblin({pos:{x:4,y:4,z:0}});
        let map = mockMap;
        let client = {
            getEntity: () => { return goblin;},
            getOtherEntities: () => { return [otherGoblin];}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.ready(EVENTS.entities);
        expect(brain.getCurrentTarget()).toEqual(undefined);
    });

    it('should identify closest target', () => {
        let map = mockMap;
        let client = {
            getEntity: () => { return goblin;},
            getOtherEntities: () => { return [warrior, wizard];}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.ready(EVENTS.entities);
        expect(brain.getCurrentTarget()).toEqual(warrior);
    });

    it('should move south towards target', () => {
        const warrior = new Warrior({pos:{x:2,y:4,z:0}});
        let map = mockMap;
        let movement;
        let client = {
            getEntity: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            getOtherEntities: () => { return [warrior, wizard];}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.currentTarget = warrior;
        brain.ready(EVENTS.position, "1");
        brain.ready(EVENTS.ping);
        expect(movement).toBe(DIRS.SOUTH);
    });

    it('should move east towards target', () => {
        let map = mockMap;
        const warrior = new Warrior({pos:{x:4,y:2,z:0}});
        let movement;
        let client = {
            getEntity: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            getOtherEntities: () => { return [warrior, wizard];}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.currentTarget = warrior;
        brain.ready(EVENTS.position, "1");
        brain.ready(EVENTS.ping);
        expect(movement).toBe(DIRS.EAST);
    });

    it('should move north towards target', () => {
        let map = mockMap;
        const warrior = new Warrior({pos:{x:2,y:0,z:0}});
        let movement;
        let client = {
            getEntity: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            getOtherEntities: () => { return [warrior, wizard];}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.currentTarget = warrior;
        brain.ready(EVENTS.position, "1");
        brain.ready(EVENTS.ping);
        expect(movement).toBe(DIRS.NORTH);
    });

    it('should move west towards target', () => {
        let map = mockMap;
        const warrior = new Warrior({pos:{x:0,y:2,z:0}});
        let movement;
        let client = {
            getEntity: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            getOtherEntities: () => { return [warrior, wizard];}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.currentTarget = warrior;
        brain.ready(EVENTS.position, "1");
        brain.ready(EVENTS.ping);
        expect(movement).toBe(DIRS.WEST);
    });

    it('should move try alternative direction if cant get to target', () => {
        let map = {
            "width":10,
            "height":10,
            "getTile": (x,y,z) => { return (y==goblin.pos.y+1) ? Tiles.floorTile : Tiles.wallTile;}
          };
        const warrior = new Warrior({pos:{x:0,y:2,z:0}});
        let movement;
        let client = {
            getEntity: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            getOtherEntities: () => { return [warrior, wizard];}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.currentTarget = warrior;
        brain.ready(EVENTS.position, "1");
        brain.ready(EVENTS.ping);
        expect(movement).toBe(DIRS.SOUTH);
    });

    it('should move try opposite direction if cant get to target', () => {
        let map = {
            "width":10,
            "height":10,
            "getTile": (x,y,z) => { return (x==goblin.pos.x+1) ? Tiles.floorTile : Tiles.wallTile;}
          };
        const warrior = new Warrior({pos:{x:0,y:2,z:0}});
        let movement;
        let client = {
            getEntity: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            getOtherEntities: () => { return [warrior, wizard];}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.currentTarget = warrior;
        brain.ready(EVENTS.position, "1");
        brain.ready(EVENTS.ping);
        expect(movement).toBe(DIRS.EAST);
    });

    it('should not move if boxed in', () => {
        let map = {
            "width":10,
            "height":10,
            "getTile": (x,y,z) => { return  Tiles.wallTile;}
          };
        const warrior = new Warrior({pos:{x:0,y:2,z:0}});
        let movement;
        let client = {
            getEntity: () => { return goblin;},
            move: (direction) => { movement = direction; }, 
            getOtherEntities: () => { return [warrior, wizard];}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.currentTarget = warrior;
        brain.ready(EVENTS.position, "1");
        brain.ready(EVENTS.ping);
        expect(movement).toBe(undefined);
    });

    it('should not move without a target', () => {
        let map = mockMap;
        let movement;
        let client = {
            getEntity: () => { return goblin;},
            move: (direction) => { movement = direction; },
            getOtherEntities: () => { return [];}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.currentTarget = null;
        brain.ready(EVENTS.position, "1");
        brain.ready(EVENTS.ping);
        expect(movement).toBe(undefined);
    });

    it('should not move when target below or above', () => {
        let map = mockMap;
        const warrior = new Warrior({pos:{x:0,y:0,z:1}});
        let movement;
        let client = {
            getEntity: () => { return goblin;},
            move: (direction) => { movement = direction; },
            getOtherEntities: () => { return [warrior, wizard];}
        };
        let messages = [];
        let brain = new GoblinBrain(map, client, messages);
        brain.speed = 0;
        brain.currentTarget = warrior;
        brain.ready(EVENTS.position);
        brain.ready(EVENTS.ping);
        expect(movement).toBe(undefined);
    });

    it('should disconnect if dead', () => {
        let disconnected = false;
        let client = {
            getEntity: () => { return goblin;},
            getOtherEntities: () => { return [];},
            disconnectFromServer: () => {disconnected = true;}
        };
        let messages = [];
        let brain = new GoblinBrain(null, client, messages);
        brain.speed = 0;
        brain.ready(EVENTS.dead);
        expect(disconnected).toBe(true);
    });

    it('should sync if delete received', () => {
        let synched = false;
        let client = {
            getEntity: () => { return goblin;},
            getOtherEntities: () => { return [];},
            sync: () => {synched = true;}
        };
        let messages = [];
        let brain = new GoblinBrain(null, client, messages);
        brain.speed = 0;
        brain.ready(EVENTS.delete);
        expect(synched).toBe(true);
    });

    it('should sync if no target for 10 turns', () => {
        let synched = false;
        let client = {
            getEntity: () => { return goblin;},
            getOtherEntities: () => { return [];},
            sync: () => {synched = true;}
        };
        let messages = [];
        let brain = new GoblinBrain(null, client, messages);
        brain.speed = 0;
        brain.syncCount = 10;
        brain.ready(EVENTS.position,"1");
        brain.ready(EVENTS.ping);
        expect(synched).toBe(true);
    });
});
