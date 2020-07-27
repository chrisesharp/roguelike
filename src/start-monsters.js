"use strict";

import io from 'socket.io-client';
import { Bots } from './monsters/index.js';
import { EVENTS } from './common/events.js';

const serverAddr = process.env.server || "http://0.0.0.0:3000";

const monsters = [];
Object.keys(Bots).forEach(key => {
    let ctor = Bots[key];
    monsters.push({type:ctor, frequency: Math.floor(Math.random()*4)+1})
  });

const live = [];

let socket = io(serverAddr, {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
    transports: ['websocket'],
});

socket.on("connect",() => {
    console.log("now we're connected to server...");
})

socket.once(EVENTS.missingRole, (error) => {
    console.log("...we can start the monsters...");
    addMonsters(serverAddr);
    socket.disconnect();
});

function addMonsters(URL) {
    monsters.forEach(entry => {
        let monster = entry.type;
        let freq = entry.frequency;
        for (let i=1; i <= freq; i++) {
            live.push(new monster(URL).start());
            console.log(`Started goblin (${i}/${freq})`);
        }
    });
}