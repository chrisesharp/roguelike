"user strict";

import Bundler from 'parcel-bundler';
import health from './health.js';
import roles from './roles.js';
import caves from './caves.js';
import reset from './reset.js'

const bundlerOpts = {
    hmrPort: process.env.HMR || 8080,
};

const bundler = new Bundler('./src/frontend/index.html', bundlerOpts);


export function use(app, server){
    health(app);
    roles(app);
    caves(app);
    reset(app, server);
    app.use(bundler.middleware());
};
