import { Application, Router } from 'express';
import * as fs from 'fs';
import * as process from 'process';

interface CaveConfig {
    cavepath?: string
}

type CaveEntry = {
    id: number,
    name: string,
    url: string
}

const filepath = process.env.CONFIG || process.env.npm_package_config_file || './src/server/config/defaults.json';
const configFile = fs.readFileSync(filepath, 'utf8');
const config: CaveConfig = JSON.parse(configFile);

const cavepath = config.cavepath || './src/server/config/caves.json';
const caveFile = fs.readFileSync(cavepath, 'utf8');
const caves: CaveEntry[] = JSON.parse(caveFile);
caves.forEach(element => {
    if (element?.url) {
        element.url =  (process.env.DOMAIN) ? `${element.url}${process.env.DOMAIN}/` : "http://localhost:3000";
    }
});

export default function (app: Application): void {
    const router = Router();
    router.get('/', function (req, res) {
        res.json(caves);
    });

    app.use("/caves", router);
}
