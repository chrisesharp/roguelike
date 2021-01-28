"user strict";

import Bundler from 'parcel-bundler';
import health from './health.js';
import roles from './roles.js';
import reset from './reset.js'

const bundlerOpts = {
    //hmrPort: 8080,
};

const bundler = new Bundler('./src/frontend/index.html', bundlerOpts);


export function use(app, server){
    health(app);
    roles(app);
    reset(app, server);
    app.use(bundler.middleware());
};
