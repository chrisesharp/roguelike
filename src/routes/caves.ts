import { Application, Router } from 'express';
import * as fs from 'fs';
import * as process from 'process';

interface CaveConfig {
    cavepath?: string
}

const filepath = process.env.CONFIG || process.env.npm_package_config_file || './src/server/config/defaults.json';
const configFile = fs.readFileSync(filepath, 'utf8');
const config: CaveConfig = JSON.parse(configFile);

const cavepath = config.cavepath || './src/server/config/caves.json';
const caveFile = fs.readFileSync(cavepath, 'utf8');
const caves: unknown = JSON.parse(caveFile);

export default function (app: Application): void {
    const router = Router();
    router.get('/', function (req, res) {
        res.json(caves);
    });

    app.use("/caves", router);
}
