"use strict";

import express from "express";
import http from "http";
import ConnectionServer from "./server/connection-server.js";
import fs from "fs";

const port = normalizePort(process.env.npm_package_config_port || '3000');
const host = '0.0.0.0';
const app = express();
app.set('port', port);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const httpServer = http.createServer(app);
httpServer.listen(port, host);
httpServer.on('listening', onListen);
httpServer.on('error', onError);

let filepath = process.env.CONFIG || process.env.npm_package_config_file || './src/config/defaults.json';
console.log("Starting server using ",filepath);
let file = fs.readFileSync(filepath, 'utf8');
let template = JSON.parse(file);

const server = new ConnectionServer(httpServer, template);

(async () => {
    const routes = await import('./routes/index.js');
    routes.use(app, server);
})();



function normalizePort(val) {
    let port = parseInt(val, 10);
  
    if (isNaN(port)) {
      return val;
    }
  
    if (port >= 0) {
      return port;
    }
  
    return false;
  }

function onListen() {
    let addr = httpServer.address();
    let bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    console.log('Listening on ', bind);
}

function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
  
    var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
      default:
        throw error;
    }
}