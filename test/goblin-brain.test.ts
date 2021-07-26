import { GoblinBrain } from "../dist/monsters/goblin-brain";
import { Goblin } from "../dist/server/entities/goblin";
import { Warrior } from "../dist/server/entities/warrior";
import { Wizard } from "../dist/server/entities/wizard";
import { DIRS } from "../dist/common/movement";
import { EVENTS } from "../dist/common/events";
import * as Tiles from '../dist/server/server-tiles';
import { Messenger } from '../dist/server/entities/server-entity';
import { GameMap } from "../dist/common/map";
import { EntityClient } from "../dist/client/entity-client";
import { Entity } from '../dist/common/entity';
import { Tile } from "../dist/common/tile";

class MockMap extends GameMap {
    tileFn?: (x:number,y:number,z:number)=>Tile;
    setTileFn(fn:(x:number,y:number,z:number)=>Tile):void { this.tileFn = fn}
    getTile(x:number,y:number,z:number):Tile { 
        if (this.tileFn) {
            return this.tileFn(x,y,z);
        } else {
            return Tiles.floorTile;
        }
    }
}
const mockMap = new MockMap({
    "width":10,
    "height":10,
    "depth":1,
  });

const nullMap = new GameMap({
    "width":0,
    "height":0,
    "depth":0,
  });

const mockServer: Messenger = () => {
// Nothing
};

class TestBrain extends GoblinBrain {
    setTarget(target:Entity|undefined): void { this.currentTarget = target; }
    setSyncCount(count:number): void { this.syncCount = count;}
    setSpeed(speed:number): void { this.speed = speed;}
}
const warrior = new Warrior({pos:{x:4,y:4,z:0},messenger:mockServer});
const wizard = new Wizard({pos:{x:5,y:5,z:0},messenger:mockServer});
const goblin = new Goblin({pos:{x:2,y:2,z:0},messenger:mockServer});

const noop = () => {
    //noop
}
class MockClient extends EntityClient {
    private us: Entity;
    private them: Entity[];
    private moveFn: (d:DIRS)=>void = noop;
    private disFn: ()=>void = noop;
    private syncFn: ()=>void = noop;

    constructor(us: Entity, them: Entity[]) {
        super("",noop);
        this.us = us;
        this.them = them;
    }
    getEntity(): Entity  { return this.us;}
    getOtherEntities(): Entity[] { return this.them;}
    move(direction:DIRS): void { this.moveFn(direction); }
    setMove(fn:(d:DIRS)=>void): void { this.moveFn = fn; }
    setDisconnect(fn:()=>void): void { this.disFn = fn; }
    disconnectFromServer():void { this.disFn();}
    setSync(fn:()=>void):void { this.syncFn = fn;}
    sync():void { this.syncFn();}
}
describe('goblin brain responses', () => {
    it('should identify targets', () => {
        const map = mockMap;
        const client = new MockClient(goblin,[warrior]);
        const messages:string[] = [];
        const brain = new TestBrain(nullMap, client, messages);
        brain.setMap(map);
        brain.setSpeed(0);
        brain.ready(EVENTS.entities);
        expect(brain.getCurrentTarget()).toEqual(warrior);
    });

    it('should ignore other goblins', () => {
        const otherGoblin = new Goblin({pos:{x:4,y:4,z:0},messenger:mockServer});
        const map = mockMap;
        const client = new MockClient(goblin,[otherGoblin]);
        const messages:string[] = [];
        const brain = new TestBrain(map, client, messages);
        brain.setSpeed(0);
        brain.ready(EVENTS.entities);
        expect(brain.getCurrentTarget()).toEqual(undefined);
    });

    it('should identify closest target', () => {
        const map = mockMap;
        const client = new MockClient(goblin,[warrior, wizard]);
        const messages:string[] = [];
        const brain = new TestBrain(map, client, messages);
        brain.setSpeed(0);
        brain.ready(EVENTS.entities);
        expect(brain.getCurrentTarget()).toEqual(warrior);
    });

    it('should move south towards target', () => {
        const warrior = new Warrior({pos:{x:2,y:4,z:0},messenger:mockServer});
        const map = mockMap;
        let movement:DIRS|undefined;
        const client = new MockClient(goblin,[warrior, wizard]);
        client.setMove((direction:DIRS)=> { movement = direction;});
        const messages:string[] = [];
        const brain = new TestBrain(map, client, messages);
        brain.setSpeed(0);
        brain.setTarget(warrior);
        brain.ready(EVENTS.position, "1");
        brain.ready(EVENTS.ping);
        expect(movement).toBe(DIRS.SOUTH);
    });

    it('should move east towards target', () => {
        const map = mockMap;
        const warrior = new Warrior({pos:{x:4,y:2,z:0},messenger:mockServer});
        let movement;
        const client = new MockClient(goblin,[warrior, wizard]);
        client.setMove((direction:DIRS)=> { movement = direction;});
        const messages:string[] = [];
        const brain = new TestBrain(map, client, messages);
        brain.setSpeed(0);
        brain.setTarget(warrior);
        brain.ready(EVENTS.position, "1");
        brain.ready(EVENTS.ping);
        expect(movement).toBe(DIRS.EAST);
    });

    it('should move north towards target', () => {
        const map = mockMap;
        const warrior = new Warrior({pos:{x:2,y:0,z:0},messenger:mockServer});
        let movement;
        const client = new MockClient(goblin,[warrior, wizard]);
        client.setMove((direction:DIRS)=> { movement = direction;})
        const messages:string[] = [];
        const brain = new TestBrain(map, client, messages);
        brain.setSpeed(0);
        brain.setTarget(warrior);
        brain.ready(EVENTS.position, "1");
        brain.ready(EVENTS.ping);
        expect(movement).toBe(DIRS.NORTH);
    });

    it('should move west towards target', () => {
        const map = mockMap;
        const warrior = new Warrior({pos:{x:0,y:2,z:0},messenger:mockServer});
        let movement;
        const client = new MockClient(goblin,[warrior, wizard]);
        client.setMove((direction:DIRS)=> { movement = direction;})
        const messages:string[] = [];
        const brain = new TestBrain(map, client, messages);
        brain.setSpeed(0);
        brain.setTarget(warrior);
        brain.ready(EVENTS.position, "1");
        brain.ready(EVENTS.ping);
        expect(movement).toBe(DIRS.WEST);
    });

    it('should move try alternative direction if cant get to target', () => {
        const map = mockMap;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        map.setTileFn((x,y,z) => { return (y==goblin.getPos().y+1) ? Tiles.floorTile : Tiles.wallTile;});
        const warrior = new Warrior({pos:{x:0,y:2,z:0},messenger:mockServer});
        let movement;
        const client = new MockClient(goblin,[warrior, wizard]);
        client.setMove((direction:DIRS)=> { movement = direction;})
        const messages:string[] = [];
        const brain = new TestBrain(map, client, messages);
        brain.setSpeed(0);
        brain.setTarget(warrior);
        brain.ready(EVENTS.position, "1");
        brain.ready(EVENTS.ping);
        expect(movement).toBe(DIRS.SOUTH);
    });

    it('should move try opposite direction if cant get to target', () => {
        const map = mockMap;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        map.setTileFn((x:number,y:number,z:number) => { return (x==goblin.getPos().x+1) ? Tiles.floorTile : Tiles.wallTile;});
        const warrior = new Warrior({pos:{x:0,y:2,z:0},messenger:mockServer});
        let movement:DIRS|undefined;
        const client = new MockClient(goblin,[warrior, wizard]);
        client.setMove((direction:DIRS)=> { movement = direction; });
        const messages:string[] = [];
        const brain = new TestBrain(map, client, messages);
        brain.setSpeed(0);
        brain.setTarget(warrior);
        brain.ready(EVENTS.position, "1");
        brain.ready(EVENTS.ping);
        expect(movement).toBe(DIRS.EAST);
    });

    it('should not move if boxed in', () => {
        const map = mockMap;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        map.setTileFn((x:number,y:number,z:number) => { return  Tiles.wallTile;});
        const warrior = new Warrior({pos:{x:0,y:2,z:0},messenger:mockServer});
        let movement:DIRS|undefined = undefined;
        const client = new MockClient(goblin,[warrior, wizard]);
        client.setMove((direction:DIRS)=> { 
            movement = direction;
        })
        const messages:string[] = [];
        const brain = new TestBrain(map, client, messages);
        brain.setSpeed(0);
        brain.setTarget(warrior);
        brain.ready(EVENTS.position, "1");
        brain.ready(EVENTS.ping);
        expect(movement).toBe(undefined);
    });

    it('should not move without a target', () => {
        const map = mockMap;
        let movement;
        const client = new MockClient(goblin,[]);
        client.setMove((direction:DIRS)=> { movement = direction;});
        const messages:string[] = [];
        const brain = new TestBrain(map, client, messages);
        brain.setSpeed(0);
        brain.setTarget(undefined);
        brain.ready(EVENTS.position, "1");
        brain.ready(EVENTS.ping);
        expect(movement).toBe(undefined);
    });

    it('should not move when target below or above', () => {
        const map = mockMap;
        const warrior = new Warrior({pos:{x:0,y:0,z:1},messenger:mockServer});
        let movement;
        const client = new MockClient(goblin,[warrior, wizard]);
        client.setMove((direction:DIRS)=> { movement = direction;});
        const messages:string[] = [];
        const brain = new TestBrain(map, client, messages);
        brain.setSpeed(0);
        brain.setTarget(warrior);
        brain.ready(EVENTS.position);
        brain.ready(EVENTS.ping);
        expect(movement).toBe(undefined);
    });

    it('should disconnect if dead', () => {
        let disconnected = false;
        const client = new MockClient(goblin,[]);
        client.setDisconnect(()=> { disconnected = true;});
        const messages:string[] = [];
        const brain = new TestBrain(nullMap, client, messages);
        brain.setSpeed(0);
        brain.ready(EVENTS.dead);
        expect(disconnected).toBe(true);
    });

    it('should sync if delete received', () => {
        let synched = false;
        const client = new MockClient(goblin,[]);
        client.setSync(()=> { synched = true;})
        const messages:string[] = [];
        const brain = new TestBrain(nullMap, client, messages);
        brain.setSpeed(0);
        brain.ready(EVENTS.delete);
        expect(synched).toBe(true);
    });

    it('should sync if no target for 10 turns', () => {
        let synched = false;
        const client = new MockClient(goblin,[]);
        client.setSync(()=> { synched = true;})
        const messages:string[] = [];
        const brain = new TestBrain(nullMap, client, messages);
        brain.setSpeed(0);
        brain.setSyncCount(10);
        brain.ready(EVENTS.position,"1");
        brain.ready(EVENTS.ping);
        expect(synched).toBe(true);
    });
});
