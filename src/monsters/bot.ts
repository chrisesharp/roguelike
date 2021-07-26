import { EntityClient} from '../client/entity-client.js';
import { ConnectionProps } from "../common/connection-props";
import { GameMap, MapTemplate } from '../common/map';
import { EVENTS } from '../common/events';
import { Brain } from './brain';
import { DIRS, Location } from '../common/movement';

export type BotProperties = {
    startPos?: Location,
    callback?: (() => void),
}

export class Bot {
    private serverAddr: string;
    private brain?: Brain;
    protected client: EntityClient;
    protected messages: string[] = [];
    protected startPos?: Partial<Location>;
    role = "";
    level = 0;

    constructor(URL: string, brain?: Brain) {
        this.serverAddr = URL;
        this.client = new EntityClient(this.serverAddr, (event, data) => this.refresh(event, data));
        this.brain = brain;
    }

    setBrain(brain: Brain ):void {
        this.brain = brain;
    }

    getBrain(): Brain|undefined {
        return this.brain;
    }

    startBot(config: BotProperties = {}): this {
        this.start({}, config.callback);
        return this;
    }

    protected start(props: ConnectionProps, callback?: (() => void)): this {
        props.type = 'monster';
        this.client.connectToServer(props, callback)
        return this;
    }

    ready(event: string, data?: unknown): void {
        this.brain?.ready(event, data);
    }

    stop(): void {
        this.client.disconnectFromServer(EVENTS.dead);
    }
 
    mapAvailable(data: MapTemplate): void {
        this.brain?.setMap(new GameMap(data));
    }

    refresh(event: string, data: unknown): void {
        if (event === EVENTS.message) {
            this.addMessage(data as string);
        }

        if (event === EVENTS.map) {
            this.mapAvailable(data as MapTemplate);
        }
        this.ready(event, data);
    }

    addMessage(messages: string | string[]): void{
        if (messages instanceof Array) {
            messages.forEach((message) => {
                this.messages.push(message);
            });
        } else {
            this.messages.push(messages);
        }
    }

    move(direction: DIRS): void {
        this.client.move(direction);
    }

    getClient(): EntityClient {
        return this.client;
    }

    getMessages(): string[] {
        return this.messages;
    }
}