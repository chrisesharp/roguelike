import { GameMap } from '../common/map';
import { Entity } from '../common/entity';
import { EntityClient } from '../client/entity-client';


export abstract class Brain {
    protected map: GameMap;
    protected client: EntityClient;
    protected messages: string | string[];
    protected currentTarget?: Entity;

    constructor(map: GameMap | undefined, client: EntityClient, messages: string | string[]) {
        this.map = map || new GameMap({height:0, width:0, depth:0});
        this.client = client;
        this.messages = messages;
    }

    abstract ready(event: string, data?: unknown): void;

    getCurrentTarget(): Entity | undefined {
        return this.currentTarget;
    }

    setMap(map: GameMap): void {
        this.map = map;
    }
}