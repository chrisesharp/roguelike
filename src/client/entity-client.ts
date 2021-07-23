import { State } from './state';
import { EVENTS } from '../common/events';
import { io, Socket } from 'socket.io-client';
import { Location } from '../common/location';
import { MapState } from '../common/map';
import { DIRS } from '../common/movement';
import { Item, ItemState } from '../common/item';
import { Entity, EntityState } from '../common/entity';

export type ClientCallback = (eventName: string, arg?: unknown) => void;
type ConnectionProps = { url?: string };

export class EntityClient {
    private state = new State();
    private socket?: Socket;
    private refreshCallback: ClientCallback;
    private serverAddr: string;
    private properties: ConnectionProps = {};

    constructor(serverAddr: string, callback: ClientCallback) {
        this.serverAddr = serverAddr;
        this.refreshCallback = callback;
    }

    connectToServer(properties: ConnectionProps, callback?: (() => void)): void {
        this.properties = properties;
        const url = properties.url || this.serverAddr;
        // console.log("Connecting to cave at ",url);
        this.socket = io(url, {
            reconnectionDelay: 0,
            transports: ['websocket'],
            auth: properties,
        });
        if (callback) {
            this.socket.once("connect", () => {
                callback();
            });
        }
        this.registerEventHandlers(this.socket, this.refreshCallback);
        this.socket.emit(EVENTS.getMap);
    }

    disconnectFromServer(event?: string): void {
        if (event) {
            this.socket?.emit(event)
        }
        this.socket?.disconnect();
    }

    private registerEventHandlers(socket: Socket, callback: ClientCallback): void {
        socket.on(EVENTS.ping, () => {
            callback(EVENTS.ping);
        });

        socket.on(EVENTS.message, (message: string) => {
            callback(EVENTS.message, message);
        });

        socket.on(EVENTS.delete, (pos: Location) => {
            this.state.removeEntityAt(pos);
            callback(EVENTS.delete, pos);
        });

        socket.on(EVENTS.map, (map: MapState) => {
            callback(EVENTS.map, map);
        });

        socket.on(EVENTS.items,(items: { [location: string]: ItemState[] }) => {
            this.state.updateItems(items);
            callback(EVENTS.items, items);
        });

        socket.on(EVENTS.entities, (entities: EntityState[]) => {
            this.state.updateEntities(socket.id, entities);
            callback(EVENTS.entities, entities);
        });

        socket.on(EVENTS.update, (entity: EntityState) => {
            this.state.updateOurself(entity);
            callback(EVENTS.update);
        });

        socket.on(EVENTS.dead, (entity: EntityState) => {
            this.state.updateOurself(entity);
            callback(EVENTS.dead);
        });

        socket.on(EVENTS.position, (event: {id: string, pos: Location}) => {
            if (!this.state.updateEntityPosition(socket.id, event)) {
                this.sync();
            }
            callback(EVENTS.position, event);
        });

        socket.on(EVENTS.reconnect, (properties: ConnectionProps) => {
            this.reconnect(properties);
            callback(EVENTS.reconnect);
        });
        
        socket.on(EVENTS.reset, (properties: ConnectionProps) => {
            this.reconnect(properties);
            callback(EVENTS.reset);
        });
    }

    sync(): void {
        this.socket?.emit(EVENTS.getMap);
        this.socket?.emit(EVENTS.getItems);
        this.socket?.emit(EVENTS.getEntities);
    }

    reconnect(properties: ConnectionProps): void {
        if (properties && properties.url) {
            this.properties.url = properties.url;
        }
        this.state = new State();
        this.disconnectFromServer();
        this.connectToServer(this.properties);
    }

    getEntityAt(x: number, y: number, z: number): Entity | undefined{
        return this.state.getEntityAt(x, y, z);
    }

    getItemsAt(x: number, y: number, z: number): Item[] {
        return this.state.getItemsAt(x, y, z);
    }

    move(direction: DIRS): void {
        this.socket?.emit(EVENTS.move, direction);
    }

    takeItem(item: Item): void {
        this.socket?.emit(EVENTS.take, item.getName());
    }

    dropItem(item: Item): void {
        this.socket?.emit(EVENTS.drop, item.getName());
    }

    eat(item: Item): void {
        this.socket?.emit(EVENTS.eat, item.getName());
    }

    wieldItem(item?: Item): void {
        const weapon = item?.getName();
        this.socket?.emit(EVENTS.wield, weapon);
    }

    wearItem(item?: Item): void {
        const armour = item?.getName();
        this.socket?.emit(EVENTS.wear, armour);
    }

    getEntity(): Entity {
        return this.state.getEntity();
    }

    getOtherEntities(): Entity[] {
        return this.state.getOthers();
    }
}