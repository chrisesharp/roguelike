import { io } from 'socket.io-client';
import { Bots } from './monsters/index';
import { EVENTS } from './common/events';
import { Bot } from './monsters/bot';
import { StartOpts } from './server';

const defaultAddr = process.env.server || "http://0.0.0.0:3000";

let deployable: MonsterRoster[] = [];

export type MonsterRoster = {type:string, frequency:number};
export interface StartMonsterOpts extends StartOpts {
    monsters?:MonsterRoster[], 
}

export async function startMonsters(options:StartMonsterOpts = {}): Promise<Bot[][]> {
    const serverAddr = (options.frontend?.host && options.frontend?.port) ? `http://${options.frontend?.host}:${options.frontend?.port}` : defaultAddr;

    return new Promise((resolve) => {
        if (options?.monsters) {
            deployable = options?.monsters;
        }
        if (deployable.length == 0) {
            Object.entries(Bots).forEach(([type, info]) => {
                const freq = Math.max(1, Math.round(Math.random() * info.numberOccurring));
                deployable.push({type:type, frequency: freq});
            });
        }

        const socket = io(serverAddr, {
            reconnectionDelay: 0,
            transports: ['websocket'],
        });
        
        socket.once(EVENTS.missingRole, async () => {
            const live = await addMonsters(serverAddr);
            socket.disconnect();
            resolve(live);
        });
    });
}

export function stopMonsters(started:Bot[][]): void {
    started.forEach((type:Bot[]) => {
        type.forEach((monster:Bot) => monster.stop());
    });
}

function addMonsters(url: string): Promise<Bot[][]> {
    return Promise.all<Bot[]>(
        deployable.map((entry:MonsterRoster) => {
            const definition = entry;
            const freq = definition.frequency;
            return new Promise<Bot[]>(async (resolveArray) => {
                const monsters:Promise<Bot>[] = [];
                for (let i=1; i <= freq; i++) {
                    monsters.push(newMonster(definition, url));
                }
                resolveArray(Promise.all(monsters));
            });
        })
    );
}

function newMonster(definition:MonsterRoster, URL:string): Promise<Bot> {
    return new Promise<Bot>((resolveIndividual) => {
        const monster:Bot = Bots[definition.type].newInstance(URL);
        const props = {
            callback: ()=> {
                resolveIndividual(monster);
            }
        }
        monster.startBot(props);
    })
}