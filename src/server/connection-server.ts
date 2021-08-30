import http from 'http';
import { Socket } from 'socket.io';
import { ItemState } from '../common/item';
import { Location } from "../common/movement";
import { EVENTS } from '../common/events';
import { ServerEntity, ServerEntityProperties } from './entities/server-entity';
import { EntityServer, EntityServerTemplate, serializeCaveItems } from './entity-server';
import { Messages } from './messages';
import { Messaging } from './messaging';
import { ConnectionProps } from "../common/connection-props";
import { Logger } from '../common/logger';
const log = new Logger();

export class ConnectionServer {
    private open = true;
    private readonly messaging: Messaging;
    readonly entityServer: EntityServer;
    private serverPrefix = process.env.CAVEID || "";

    constructor(http: http.Server, template: EntityServerTemplate) {
        this.messaging = new Messaging(http, this.serverPrefix, socket => this.connection(socket));
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
        this.messaging.sendToAll(EVENTS.entities, server.getEntities().map(entity => entity.serialize()));
        this.enterRoom(socket, entity, String(server.getRoom(entity.getPos())));
    }

    stop(): void {
        this.messaging.stop();
        this.open = false;
    }

    registerEventHandlers(socket: Socket, entity: ServerEntity, server: EntityServer): void {
        socket.on(EVENTS.message, (message) => {
            const rooms = socket.rooms.values();
            log.debug(socket.id, EVENTS.message);
            let room;
            for (const id of rooms) {
                if (id !== socket.id) {
                    room = id;
                    break;
                }
            }
            log.debug(socket.id, EVENTS.message, `forwarding to room ${this.serverPrefix+room}`);
            socket.emit(EVENTS.message, `You shout "${message}"`);
            socket.broadcast.to(this.serverPrefix+room).emit(EVENTS.message, `${entity.describeA()} shouted "${message}"`);
        });

        socket.on(EVENTS.getEntities, () => {
            log.debug(socket.id, EVENTS.entities, server.getEntities().map(entity => entity.serialize()));
            socket.emit(EVENTS.entities, server.getEntities().map(entity => entity.serialize()));
        });

        socket.on(EVENTS.getItems, () => {
            log.debug(socket.id, EVENTS.items, this.getItemStatesForRoom(entity.getPos()));
            socket.emit(EVENTS.items, this.getItemStatesForRoom(entity.getPos()));
        });

        socket.on(EVENTS.getMap, () => {
            log.debug(socket.id, EVENTS.map, server.getMapState(entity));
            socket.emit(EVENTS.map, server.getMapState(entity));
        });

        socket.on(EVENTS.getPosition, () => {
            log.debug(socket.id, EVENTS.position, entity.getEntityLocation());
            socket.emit(EVENTS.position, entity.getEntityLocation());
        });

        socket.on(EVENTS.take, (itemName) => {
            log.debug(socket.id, EVENTS.take, itemName);
            if (entity.isAlive()) server.takeItem(entity, itemName);
        });

        socket.on(EVENTS.drop, (itemName) => {
            log.debug(socket.id, EVENTS.drop, itemName);
            if (entity.isAlive()) server.dropItem(entity, itemName);
        });

        socket.on(EVENTS.dig, (pos) => {
            log.debug(socket.id, EVENTS.dig, pos);
            if (entity.isAlive()) {
                const dug = server.digWall(entity, pos);
                if (dug) {
                    socket.emit(EVENTS.map, server.getMapState(entity));
                }
            }
        });

        socket.on(EVENTS.eat, (food) => {
            log.debug(socket.id, EVENTS.eat, food);
            if (entity.isAlive()) entity.eat(food);
        });

        socket.on(EVENTS.wield, (weapon) => {
            log.debug(socket.id, EVENTS.wield, weapon);
            if (entity.isAlive()) entity.wield(weapon);
        });

        socket.on(EVENTS.wear, (armour) => {
            log.debug(socket.id, EVENTS.wear, armour);
            if (entity.isAlive()) entity.wear(armour);
        });

        socket.on(EVENTS.move, (direction) => {
            log.debug(socket.id, EVENTS.move, direction);
            if (entity.isAlive()) {
                const startRoom = server.getRoom(entity.getPos());
                const newPos = server.moveEntity(entity, direction);
                if (newPos && startRoom !== server.getRoom(newPos)) {
                    this.moveRooms(socket, entity, String(startRoom));
                }
            }
        });

        socket.on(EVENTS.dead, () => {
            log.debug(socket.id, EVENTS.dead, entity);
            entity.kill();
        });

        socket.on(EVENTS.disconnect, () => {
            log.debug(socket.id, EVENTS.disconnect, entity);
            server.deleteEntity(entity);
        });
    }

    moveRooms(socket: Socket, entity: ServerEntity, startRoom: string): void {
        this.leaveRoom(socket, entity, startRoom);
        this.enterRoom(socket, entity, String(this.entityServer.getRoom(entity.getPos())));
    }

    enterRoom(socket: Socket, entity: ServerEntity, room: string): void {
        socket.join(this.serverPrefix+room);
        socket.broadcast.to(this.serverPrefix+room).emit(EVENTS.message, Messages.ENTER_ROOM(entity.describeA()));
        socket.emit(EVENTS.items, this.getItemStatesForRoom(entity.getPos()));
    }

    leaveRoom(socket: Socket, entity: ServerEntity, room: string): void {
        socket.leave(this.serverPrefix+room);

    }

    reset(properties: ConnectionProps = {}): void {
        this.entityServer.reset(properties);
        log.debug('Server reset');
    }

    private getItemStatesForRoom(position: Location): { [pos: string]: ItemState[] } {
        const itemsByLocation = this.entityServer.getItemsForRoom(position);
        return serializeCaveItems(itemsByLocation);
    }
}