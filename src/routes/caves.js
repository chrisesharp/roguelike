"user strict";

import express from 'express';
import fs from 'fs';

const filepath = process.env.CONFIG || process.env.npm_package_config_file || './src/server/config/defaults.json';
const configFile = fs.readFileSync(filepath, 'utf8');
const config = JSON.parse(configFile);

const cavepath = config.cavepath || './src/server/config/caves.json';
const caveFile = fs.readFileSync(cavepath, 'utf8');
const caves = JSON.parse(caveFile);

export default function (app)  {
  let router = express.Router();
  router.get('/', function (req, res, next) {
    res.json(caves);
  });

  app.use("/caves", router);
}