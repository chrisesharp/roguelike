import { io } from 'socket.io-client';
import { Bots } from './monsters/index';
import { EVENTS } from './common/events';

const serverAddr = process.env.server || "ws://0.0.0.0:3000";
const monsters = process.env.monsters;
let deployable: string[] = [];
const live = [];

export function startMonsters(): void {
    if (monsters) {
        deployable = JSON.parse(monsters);
    }
    if (deployable.length == 0) {
        Object.entries(Bots).forEach(([type, info]) => {
            const freq = Math.max(1, Math.round(Math.random() * info.numberOccurring));
            deployable.push(`{"type":"${type}", "frequency": "${freq}"}`);
        });
    }

    const socket = io(serverAddr, {
        reconnectionDelay: 0,
        transports: ['websocket'],
    });
    
    socket.on("connect",() => {
        console.log("now we know the server is ready...");
    })
    
    socket.once(EVENTS.missingRole, () => {
        console.log("...we can start the monsters...");
        addMonsters(serverAddr);
        socket.disconnect();
    });
}

function addMonsters(URL: string) {
    deployable.forEach(entry => {
        const definition = JSON.parse(entry);
        const freq = definition.frequency;
        for (let i=1; i <= freq; i++) {
            const monster = Bots[definition.type].newInstance(URL);
            const props = {
                callback: ()=> {
                    console.log(`Started ${monster.role} on level ${monster.level - 1} (${i}/${freq})`);
                }
            }
            live.push(monster.startBot(props));
        }
    });
}