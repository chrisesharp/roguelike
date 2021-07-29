import { Server, StartOpts } from './server';
import { BackendServer } from './backend-server';
import { FrontendServer } from './frontend-server';
import { startMonsters, StartMonsterOpts, MonsterRoster } from './start-monsters';
import { Bot } from './monsters/bot';

export async function start(role?:string):Promise<Server|Bot[][]> {
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
            return Promise.resolve(started);
            break;
        case "FRONTEND":
            console.log("....frontend!");
            const feOpts:StartOpts = {frontend:{port:port,host:host}};
            return new FrontendServer(feOpts);
            break;
        case "BACKEND":
            console.log("...the kaverns!");
            console.log('Starting server using ', filepath);
            const beOpts:StartOpts = {config:filepath};
            return new BackendServer(beOpts);
            break;
        default:
            console.log("...the frontend, kaverns and monsters!");
            console.log('Starting server using ', filepath);
            const allOpts:StartOpts = {config:filepath,frontend:{host:host, port:port}};
            startMonsters(mOpts);
            return new BackendServer(allOpts);
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