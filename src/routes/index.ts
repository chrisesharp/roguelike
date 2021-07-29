import Bundler from 'parcel-bundler';
import health from './health';
import roles from './roles';
import caves from './caves';
import reset from './reset';
import { Application } from 'express';
import { StartOpts } from '../server';
import * as process from 'process';
import { ConnectionServer } from '../server/connection-server';

const bundlerOpts = {
    hmrPort: process.env.HMR || 8080,
};

// This should probably be building a path using __dirname and path.join()
const bundler = new Bundler('./src/frontend/index.html', bundlerOpts);

// eslint-disable-next-line @typescript-eslint/ban-types
export function use(app: Application, opts: StartOpts): void {
    health(app);
    roles(app);
    caves(app);
    if (opts.backend) reset(app, opts.backend as ConnectionServer);
    if (opts?.frontend) app.use(bundler.middleware());
}
