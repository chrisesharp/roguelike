"user strict";

import Bundler from 'parcel-bundler';
import health from './health.js';
import roles from './roles.js';

const bundlerOpts = {
    hmrPort: 8080,
};

const bundler = new Bundler('./src/frontend/index.html', bundlerOpts);


export function use(app){
    health(app);
    roles(app);
    app.use(bundler.middleware());
};
