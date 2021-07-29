// import express from 'express';
// import http from 'http';
import * as routes from './routes';
// import * as process from 'process';
import { Server, StartOpts } from './server';

// const PORT = '3000';
// const HOST = '0.0.0.0';
// let app: express.Express;
// let hs: http.Server;


export class FrontendServer extends Server {

    constructor(options:StartOpts = {}) {
        super(options);
        // this.port = options.frontend?.port || PORT;
        // this.host = options.frontend?.host || HOST;
        // this.app = createAppServer(this.port);
        // this.hs = createHttpServer(this.host, this.port, this.app);
        routes.use(this.app, options);
    }
}

// export function startFrontEnd(options:StartOpts = {}): void {
//     const port = options.frontend?.port || PORT;
//     const host = options.frontend?.host || HOST;
//     app = createAppServer(port);
//     hs = createHttpServer(host, port, app);
//     routes.use(app, options);
// }

// export function stopServer(): void {
//     hs.close();
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
//     httpServer.on('error', (err) => onError(err,port));
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

// function onError(error: Error & { syscall?: string; code?: string }, port:number|string): void {
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