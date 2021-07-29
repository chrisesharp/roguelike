// import express from 'express';
// import http from 'http';
import { ConnectionServer } from './server/connection-server';
import { Server, StartOpts } from './server';
// import fs from 'fs';
import * as routes from './routes';
// import * as process from 'process';


export class BackendServer extends Server {
    // port: string;
    // host: string;
    // private app: express.Express;
    private cs: ConnectionServer;
    // private hs: http.Server;

    constructor(options:StartOpts = {}) {
        // this.port = normalizePort(process.env.PORT || process.env.npm_package_config_port || '3000');
        // this.host = '0.0.0.0'; 
        // const template = getConfig(options?.config);
        // this.app = createAppServer(this.port);
        // this.hs = createHttpServer(this.host, this.port, this.app);
        super(options);
        this.cs = new ConnectionServer(this.hs, this.config);
        options.backend = this.cs;
        routes.use(this.app, options);
    }

    stop(): void {
        this.cs.stop();
        super.stop();
    }
}

// export function startServer(options:StartOpts = {}): void {
//     const template = getConfig(options?.config);
//     app = createAppServer(port);
//     hs = createHttpServer(host, port, app);
//     cs = new ConnectionServer(hs, template);
//     options.backend = cs;
//     routes.use(app, options);
// }

// export function stopServer(): void {
//     cs.stop();
//     hs.close();
// }

// function getConfig(config?:string) {
//     const filepath = config || process.env.CONFIG || process.env.npm_package_config_file || './src/server/config/defaults.json';
//     const file = fs.readFileSync(filepath, 'utf8');
//     return JSON.parse(file);
// }

// function createAppServer(port: number): express.Express {
//     const app = express();
//     app.set('port', port);
//     app.use(express.json());
//     app.set('json spaces', 4);
//     app.use(express.urlencoded({ extended: false }));
//     app.use(function (req, res, next) {
//         res.header('Access-Control-Allow-Origin', '*');
//         res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//         next();
//     });
//     return app;
// }

// function createHttpServer(host: string, port: number, app: express.Express): http.Server {
//     const httpServer = http.createServer(app);
//     httpServer.listen(port, host);
//     httpServer.on('listening', () => onListen(httpServer));
//     httpServer.on('error', onError);
//     return httpServer;
// }

// function normalizePort(val: string): number {
//     const port = parseInt(val, 10);
//     if (isNaN(port) || port < 0) {
//         throw new Error(`Invalid port: ${val}`);
//     }
//     return port;
// }

// function onListen(httpServer: http.Server): void {
//     const addr = httpServer.address() ?? '';
//     const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
//     console.log('Listening on ', bind);
// }

// function onError(error: Error & { syscall?: string; code?: string }): void {
//     if (error.syscall !== 'listen') {
//         throw error;
//     }

//     const bind = typeof port === 'string'
//         ? 'Pipe ' + port
//         : 'Port ' + port;

//     switch (error.code) {
//         case 'EACCES':
//             console.error(bind + ' requires elevated privileges');
//             process.exit(1);
//             return;
//         case 'EADDRINUSE':
//             console.error(bind + ' is already in use');
//             process.exit(1);
//             return;
//         default:
//             throw error;
//     }
// }