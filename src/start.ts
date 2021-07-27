import { startServer } from './start-server';
import { startFrontEnd } from './start-frontend';
import { startMonsters, StartMonsterOpts, MonsterRoster } from './start-monsters';
import { StartOpts } from './start-server';

async function start(role?:string) {
    const filepath = process.env.CONFIG || process.env.npm_package_config_file || './src/server/config/defaults.json'; 
    const port = normalizePort(process.env.PORT || process.env.npm_package_config_port || '3000');
    const host = '0.0.0.0';
    const monsters = process.env.monsters;
    const mOpts:StartMonsterOpts = (monsters) ? {monsters: JSON.parse(monsters) as MonsterRoster[]} : {};
            
    switch(role) {
        case "MONSTERS":
            console.log("...monsters!");
            const started = await startMonsters(mOpts);
            started.forEach(type => {
                type.forEach(monster => {
                    console.log(`Started ${monster.role} on level ${monster.level - 1}`);
                });
            });
            break;
        case "FRONTEND":
            console.log("....frontend!");
            const feOpts:StartOpts = {frontend:{port:port,host:host}};
            startFrontEnd(feOpts);
            break;
        case "BACKEND":
            console.log("...the kaverns!");
            console.log('Starting server using ', filepath);
            const beOpts:StartOpts = {config:filepath};
            startServer(beOpts);
            break;
        default:
            console.log("...the frontend, kaverns and monsters!");
            console.log('Starting server using ', filepath);
            const allOpts:StartOpts = {config:filepath,frontend:{host:host, port:port}};
            startServer(allOpts);
            startMonsters(mOpts);
    }
}

function normalizePort(val: string): number {
    const port = parseInt(val, 10);
    if (isNaN(port) || port < 0) {
        throw new Error(`Invalid port: ${val}`);
    }
    return port;
}
console.log("Starting...");
start(process.env.ROLE);