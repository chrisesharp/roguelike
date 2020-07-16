"use strict";

import io from 'socket.io-client';
import GoblinBot from './monsters/goblin-bot.js';
import { EVENTS } from '../common/events.js';

const serverAddr = process.env.server || "http://0.0.0.0:3000";
const monsters = [];

let socket = io(serverAddr, {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
    transports: ['websocket'],
});

console.log("Starting monsters...");
socket.on("connect",() => {
    console.log("...now we're connected to server.");
})

socket.once(EVENTS.missingRole, (error) => {
    addMonsters(serverAddr);
    socket.disconnect();
});

function addMonsters(URL) {
    for (let i = 0; i < 3; i++) {
        monsters.push(new GoblinBot(URL).start());
        console.log("Started goblin ",i);
    }
}