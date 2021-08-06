import { Server, StartOpts } from './server';
import { BackendServer } from './backend-server';
import { FrontendServer } from './frontend-server';
import { startMonsters } from './start-monsters';
import { Bot } from './monsters/bot';
import { Logger } from './common/logger';
const log = new Logger();

export async function start(role?:string, portNum?:string):Promise<Server|Bot[][]> {
    const filepath = process.env.CONFIG || process.env.npm_package_config_file || './src/server/config/defaults.json'; 
    const monsterPath = process.env.MONSTERS || './src/server/config/monsters.json';
    const port = portNum ?? process.env.PORT ?? process.env.npm_package_config_port ?? '3000';
    const host = '0.0.0.0';
    const mOpts:StartOpts = {config: monsterPath, host:host, port:port};

    log.info(`Running start with ${role}, ${port}`);
    switch(role) {
        case "MONSTERS":
            log.info("...monsters!");
            const started = await startMonsters(mOpts);
            started.forEach(type => {
                type.forEach(monster => {
                    log.info(`Started ${monster.role} on level ${monster.level - 1}`);
                });
            });
            return Promise.resolve(started);
        case "FRONTEND":
            log.info("....frontend!");
            const feOpts:StartOpts = {frontend:{port:port,host:host}};
            return new FrontendServer(feOpts);
        case "BACKEND":
            log.info("...the kaverns!");
            log.info(`Starting server using ${filepath}`);
            const beOpts:StartOpts = {host:host, port:port, config:filepath};
            return new BackendServer(beOpts);
        case "SERVER":
            log.info("...the frontend and kaverns!");
            log.info(`Starting server using ${filepath}`);
            const svrOpts:StartOpts = {host:host, port:port, config:filepath,frontend:{host:host, port:port}};
            return new BackendServer(svrOpts);
        default:
            log.info("...the frontend, kaverns and monsters!");
            log.info(`Starting server using ${filepath}`);
            const allOpts:StartOpts = {host:host, port:port, config:filepath,frontend:{host:host, port:port}};
            startMonsters(mOpts);
            return new BackendServer(allOpts);
    }
}