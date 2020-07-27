"use strict";

import io from 'socket.io-client';
import { Bots } from './monsters/index.js';
import { EVENTS } from './common/events.js';

const serverAddr = process.env.server || "http://0.0.0.0:3000";

const monsters = [];
Object.keys(Bots).forEach(key => {
    let type = Bots[key];
    monsters.push({type:type, frequency: Math.max(1,Math.round(Math.random()*type.numberOccuring))})
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
        let freq = entry.frequency;
        for (let i=1; i <= freq; i++) {
            let monster = new entry.type(URL);
            live.push(monster.start());
            console.log(`Started ${monster.role} (${i}/${freq}) on level ${monster.startPos.z}`);
        }
    });
}