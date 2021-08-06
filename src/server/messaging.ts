import http from 'http';
import { Server, Socket } from 'socket.io';
import { Entity } from '../common/entity';
import { Logger } from '../common/logger';
const log = new Logger();

const pingFreqInMs = 250;
export class Messaging {
    private readonly backend: Server;
    private readonly pinger: NodeJS.Timeout;

    constructor(http: http.Server, callback: (socket: Socket) => void) {
        this.backend = new Server(http);
        this.backend.on('connection', (socket) => callback(socket));
        this.pinger = setInterval(() => this.backend.emit('ping'), pingFreqInMs);
    }

    stop(): void {
        log.debug("messaging.stop()");
        clearInterval(this.pinger);
        this.backend.close();
    }

    sendToRoom(room: number, cmd: string, data: unknown): void {
        log.debug(`messaging.sendToRoom()| ${room}, ${cmd}`, data);
        this.backend.in(String(room)).emit(cmd, data);
    }

    sendToAll(cmd: string, data: unknown): void {
        log.debug(`messaging.sendToAll()| ${cmd}`, data);
        this.backend.emit(cmd, data);
    }

    sendMessageToAll(...message: string[]): void {
        log.debug(`messaging.sendMessageToAll()| ${message}`);
        this.backend.emit('message', message);
    }

    // sendMessageToRoom(room: string, ...message: string[]): void {
    //     this.backend.in(room).emit('message', message); 
    // }

    sendMessageToId(id: string, cmd: string, data: unknown): void {
        log.debug(`messaging.sendToId()| ${id}, ${cmd}`, data);
        this.backend.to(id).emit(cmd, data);
    }

    sendMessageToEntity(entity: Entity, cmd: string, data: unknown): void {
        log.debug(`messaging.sendToEntity()| ${entity.id}, ${cmd}`, data);
        this.sendMessageToId(entity.id, cmd, data);
    }
}
