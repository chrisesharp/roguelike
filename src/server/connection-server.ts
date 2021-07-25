import http from 'http';
import { Socket } from 'socket.io';
import { ItemState } from '../common/item';
import { Location } from "../common/location";
import { EVENTS } from '../common/events';
import { ServerEntity, ServerEntityProperties } from './entities/server-entity';
import { EntityServer, EntityServerTemplate, serializeCaveItems } from './entity-server';
import { Messages } from './messages';
import { Messaging } from './messaging';
import { ConnectionProps } from "../common/connection-props";

export class ConnectionServer {
    private open = true;
    private readonly messaging: Messaging;
    readonly entityServer: EntityServer;

    constructor(http: http.Server, template: EntityServerTemplate) {
        this.messaging = new Messaging(http, socket => this.connection(socket));
        this.entityServer = new EntityServer(this.messaging, template);
    }

    connection(socket: Socket): void {
        if (this.open) {
            const prototype = socket.handshake.auth as ServerEntityProperties & { pos: string | Location };
            if (!prototype.role) {
                socket.emit(EVENTS.missingRole);
            } else {
                this.enter(this.entityServer, socket, prototype);
            }
        }
    }

    enter(server: EntityServer, socket: Socket, prototype: ServerEntityProperties & { pos: string | Location }): void {
        const entity = server.createEntity(socket.id, prototype);
        this.registerEventHandlers(socket, entity, server);
        // this.messaging.sendToAll(EVENTS.entities, server.getEntities());
        this.messaging.sendToAll(EVENTS.entities, server.getEntities().map(entity => entity.serialize()));
        this.enterRoom(socket, entity, String(server.getRoom(entity.getPos())));
    }

    stop(): void {
        this.messaging.stop();
        this.open = false;
    }

    registerEventHandlers(socket: Socket, entity: ServerEntity, server: EntityServer): void {
        socket.on(EVENTS.getEntities, () => {
            socket.emit(EVENTS.entities, server.getEntities().map(entity => entity.serialize()));
        });

        socket.on(EVENTS.getItems, () => {
            socket.emit(EVENTS.items, this.getItemStatesForRoom(entity.getPos()));
        });

        socket.on(EVENTS.getMap, () => {
            socket.emit(EVENTS.map, server.getMapState(entity));
        });

        socket.on(EVENTS.getPosition, () => {
            socket.emit(EVENTS.position, entity.getEntityLocation());
        });

        socket.on(EVENTS.take, (itemName) => {
            if (entity.isAlive()) server.takeItem(entity, itemName);
        });

        socket.on(EVENTS.drop, (itemName) => {
            if (entity.isAlive()) server.dropItem(entity, itemName);
        });

        socket.on(EVENTS.eat, (food) => {
            if (entity.isAlive()) entity.eat(food);
        });

        socket.on(EVENTS.wield, (weapon) => {
            if (entity.isAlive()) entity.wield(weapon);
        });

        socket.on(EVENTS.wear, (armour) => {
            if (entity.isAlive()) entity.wear(armour);
        });

        socket.on(EVENTS.move, (direction) => {
            if (entity.isAlive()) {
                const startRoom = server.getRoom(entity.getPos());
                const newPos = server.moveEntity(entity, direction);
                if (newPos && startRoom !== server.getRoom(newPos)) {
                    this.moveRooms(socket, entity, String(startRoom));
                }
            }
        });

        socket.on(EVENTS.dead, () => {
            entity.kill();
        });

        socket.on(EVENTS.disconnect, () => {
            server.deleteEntity(entity);
        });
    }

    moveRooms(socket: Socket, entity: ServerEntity, startRoom: string): void {
        this.leaveRoom(socket, entity, startRoom);
        this.enterRoom(socket, entity, String(this.entityServer.getRoom(entity.getPos())));
    }

    enterRoom(socket: Socket, entity: ServerEntity, room: string): void {
        socket.join(room);
        socket.broadcast.to(room).emit(EVENTS.message, Messages.ENTER_ROOM(entity.describeA()));
        socket.emit(EVENTS.items, this.getItemStatesForRoom(entity.getPos()));
    }

    leaveRoom(socket: Socket, entity: ServerEntity, room: string): void {
        // socket.leave(room, () => {
        //     this.messaging.sendMessageToRoom(room, Messages.LEAVE_ROOM(entity.describeA()));
        // });
        socket.leave(room);

    }

    reset(properties: ConnectionProps = {}): void {
        this.entityServer.reset(properties);
        // console.log('Server reset');
    }

    private getItemStatesForRoom(position: Location): { [pos: string]: ItemState[] } {
        const itemsByLocation = this.entityServer.getItemsForRoom(position);
        return serializeCaveItems(itemsByLocation);
    }
}