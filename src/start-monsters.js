"use strict";

import { io } from 'socket.io-client';
import { Bots } from './monsters/index.js';
import { EVENTS } from './common/events';

const botConstructors =  {};
const serverAddr = process.env.server || "http://0.0.0.0:3000";
const monsters = process.env.monsters || [];

Object.keys(Bots).forEach(key => {
    let ctor = Bots[key];
    let type = ctor.toString().split(' ')[1];
    botConstructors[type] = ctor;
});

if (monsters.length == 0) {
    Object.keys(botConstructors).forEach(type => {
        let ctor = botConstructors[type];
        let freq = Math.max(1, Math.round(Math.random() * ctor.numberOccuring));
        monsters.push(`{"type":"${type}", "frequency": "${freq}"}`);
    });
}
const live = [];

let socket = io(serverAddr, {
    reconnectionDelay: 0,
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
        entry = JSON.parse(entry);
        let freq = entry.frequency;
        for (let i=1; i <= freq; i++) {
            let monster = new botConstructors[entry.type](URL);
            live.push(monster.start(null, ()=> {
            // live.push(monster.start({z:0}, ()=> {
                console.log(`Started ${monster.role} (${i}/${freq})`);
            }));
        }
    });
}