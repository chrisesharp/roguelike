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
const re = new RegExp("(^https?:\/\/)|[:.]");

const cavepath = config.cavepath || './src/server/config/caves.json';
const caveFile = fs.readFileSync(cavepath, 'utf8');
const caves: CaveEntry[] = JSON.parse(caveFile);
caves.map(fixURL);

export default function (app: Application): void {
    const router = Router();
    router.get('/', function (req, res) {
        log.debug(`Receiving GET...our domain is ${process.env.DOMAIN}`);
        if (process.env.DOMAIN && process.env.DOMAIN !== ':3000') {
            log.debug(`Proxying GET to ${serviceAddr}`);
            axios.get(`${serviceAddr}/caves`,{
                timeout: 2500
            }).then( (result) => {
                log.debug("Received result:",result.data);
                const response: CaveEntry[] = result.data;
                response.map(fixURL);
                log.debug("Returning processed result:",response);
                res.json(response);
            }).catch( (err) => {
                log.debug("something went wrong ", err);
                res.json(caves);
            });
        } else {
            log.debug("Returning local file", caves);
            res.json(caves);   
        }
    });

    app.use("/caves", router);
}


function fixURL(element:CaveEntry): CaveEntry {
    if (element?.url) {
        if (process.env.DOMAIN) {
            const parts = element.url.split(re);
            element.url =  parts[1] + parts[2] + process.env.DOMAIN;
        } else {
            element.url = "http://localhost:3000";
        }
    }
    return element;
}