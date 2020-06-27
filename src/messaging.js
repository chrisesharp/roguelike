"use strict";

export default class Messaging{
    constructor(backend) {
        this.backend = backend;
    }

    sendToRoom(room, cmd, data) {
        this.backend.in(room).emit(cmd, data);
    }

    sendToAll(cmd, data) {
        this.backend.emit(cmd, data);
    }

    sendMessageToRoom(room, ...message) {
        this.backend.in(room).emit('message', message); 
    }

    sendMessageToId(id, cmd, data) {
        this.backend.to(id).emit(cmd, data);
    }

    sendMessageToEntity(entity, cmd, data) {
        this.sendMessageToId(entity.id, cmd, data);
    }
}