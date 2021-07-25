import { io } from 'socket.io-client';
import { Bots } from './monsters/index';
import { EVENTS } from './common/events';
import { Bot } from './monsters/bot';

const serverAddr = process.env.server || "http://0.0.0.0:3000";

let deployable: MonsterRoster[] = [];
const live:Bot[] = [];

export type MonsterRoster = {type:string, frequency:number};
export type StartMonsterOpts = {monsters?:MonsterRoster[]}; 

export function startMonsters(options:StartMonsterOpts = {}): void {
    if (options?.monsters) {
        deployable = options?.monsters;
    }
    if (deployable.length == 0) {
        Object.entries(Bots).forEach(([type, info]) => {
            const freq = Math.max(1, Math.round(Math.random() * info.numberOccurring));
            deployable.push({type:type, frequency: freq});
        });
    }
    console.log(deployable)

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

export function stopMonsters(): void {
    live.forEach(monster => {
        monster.stop();
    });
}

function addMonsters(URL: string) {
    deployable.forEach((entry:MonsterRoster) => {
        const definition = entry;
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