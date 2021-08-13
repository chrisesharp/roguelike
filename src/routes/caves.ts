import { Application, Router } from 'express';
import * as fs from 'fs';
import * as process from 'process';
import axios from 'axios';
import { Logger } from '../common/logger';

const log = new Logger();

interface CaveConfig {
    cavepath?: string
}

type CaveEntry = {
    id: number,
    name: string,
    url: string
}

const serviceAddr = "http://cavern-service:3000";
const filepath = process.env.CONFIG || process.env.npm_package_config_file || './src/server/config/defaults.json';
const configFile = fs.readFileSync(filepath, 'utf8');
const config: CaveConfig = JSON.parse(configFile);

const cavepath = config.cavepath || './src/server/config/caves.json';
const caveFile = fs.readFileSync(cavepath, 'utf8');
const caves: CaveEntry[] = JSON.parse(caveFile);
caves.forEach(element => {
    if (element?.url) {
        element.url =  (process.env.DOMAIN) ? `${element.url}${process.env.DOMAIN}` : "http://localhost:3000";
    }
});

export default function (app: Application): void {
    const router = Router();
    router.get('/', function (req, res) {
        log.debug(`Receiving GET...our domain is ${process.env.DOMAIN}`);
        if (process.env.DOMAIN && process.env.DOMAIN !== ':3000') {
            log.debug(`Proxying GET to ${serviceAddr}`);
            axios.get(`${serviceAddr}/caves`,{
                timeout: 2500
            }).then( (result) => {
                res.json(result.data);
            }).catch( (err) => {
                log.debug("something went wrong ", err);
                res.json(caves);
            });
        } else {
            log.debug("Returning local file", serviceAddr);
            res.json(caves);   
        }
    });

    app.use("/caves", router);
}
