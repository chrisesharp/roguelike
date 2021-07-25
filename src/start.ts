import { startServer } from './start-server';
import { startMonsters, StartMonsterOpts, MonsterRoster } from './start-monsters';

async function start(role?:string) {
    switch(role) {
        case "MONSTERS":
            console.log("...monsters!");
            const monsters = process.env.monsters;
            const opts:StartMonsterOpts = (monsters) ? {monsters: JSON.parse(monsters) as MonsterRoster[]} : {};
            const started = await startMonsters(opts);
            started.forEach(type => {
                type.forEach(monster => {
                    console.log(`Started ${monster.role} on level ${monster.level - 1}`);
                });
            });
            break;
        default:
            console.log("...the kaverns!");
            startServer();
    }
}

console.log("Starting...");
start(process.env.ROLE);