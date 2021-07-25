import Bundler from 'parcel-bundler';
import health from './health';
import roles from './roles';
import caves from './caves';
import reset from './reset';
import { Application } from 'express';
import { ConnectionServer } from '../server/connection-server';
import { StartOpts } from '../start-server';
import * as process from 'process';

const bundlerOpts = {
    hmrPort: process.env.HMR || 8080,
};

// This should probably be building a path using __dirname and path.join()
const bundler = new Bundler('./src/frontend/index.html', bundlerOpts);

export function use(app: Application, server: ConnectionServer, opts: StartOpts): void {
    health(app);
    roles(app);
    caves(app);
    reset(app, server);
    if (!opts?.test) {
        app.use(bundler.middleware());
    }
}
