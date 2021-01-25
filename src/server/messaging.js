"use strict";

import { Server } from "socket.io";

const pingFreqInMs = 250;
export default class Messaging{
    constructor(http, callback) {
        this.backend = new Server(http);
        this.backend.on("connection", (socket) => { callback(socket); });
        const messaging = this;
        this.pinger = setInterval(() => messaging.backend.emit('ping'), pingFreqInMs);
    }

    stop() {
        clearInterval(this.pinger);
    }

    sendToRoom(room, cmd, data) {
        this.backend.in(room).emit(cmd, data);
    }

    sendToAll(cmd, data) {
        this.backend.emit(cmd, data);
    }

    sendMessageToAll(...message) {
        this.backend.emit('message', message);
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