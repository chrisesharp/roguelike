import http from 'http';
import { Socket } from 'socket.io';
import { Location } from 'src/common/item';
import { EVENTS } from '../common/events';
import { ServerEntity, ServerEntityProperties } from './entities/server-entity';
import { EntityServer, EntityServerTemplate } from './entity-server';
import { Messages } from './messages';
import { Messaging } from './messaging';

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
        this.messaging.sendToAll(EVENTS.entities, server.getEntities());
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
            const itemsByLocation = server.getItemsForRoom(entity.getPos());
            const entries = Object.entries(itemsByLocation)
                .map(([location, items]) => [location, items.map(item => item.serialize())]);
            socket.emit(EVENTS.items, Object.fromEntries(entries));
        });

        socket.on(EVENTS.getMap, () => {
            socket.emit(EVENTS.map, server.getMap(entity));
        });

        socket.on(EVENTS.getPosition, () => {
            socket.emit(EVENTS.position, entity.getEntityLocation());
        });

        socket.on(EVENTS.take, (itemName) => {
            server.takeItem(entity, itemName);
        });

        socket.on(EVENTS.drop, (itemName) => {
            server.dropItem(entity, itemName);
        });

        socket.on(EVENTS.eat, (food) => {
            entity.eat(food);
        });

        socket.on(EVENTS.wield, (weapon) => {
            entity.wield(weapon);
        });

        socket.on(EVENTS.wear, (armour) => {
            entity.wear(armour);
        });

        socket.on(EVENTS.move, (direction) => {
            const startRoom = server.getRoom(entity.getPos());
            const newPos = server.moveEntity(entity, direction);
            if (newPos && startRoom !== server.getRoom(newPos)) {
                this.moveRooms(socket, entity, String(startRoom));
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
        socket.emit(EVENTS.items, this.entityServer.getItemsForRoom(entity.getPos()));
    }

    leaveRoom(socket: Socket, entity: ServerEntity, room: string): void {
        // socket.leave(room, () => {
        //     this.messaging.sendMessageToRoom(room, Messages.LEAVE_ROOM(entity.describeA()));
        // });
        socket.leave(room);

    }

    reset(properties: EntityServerTemplate = {}): void {
        this.entityServer.reset(properties);
        // console.log('Server reset');
    }
}