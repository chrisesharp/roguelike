"user strict";

import Bundler from 'parcel-bundler';
// import map from './map.js';
import health from './health.js';

const bundlerOpts = {
    hmrPort: 8080,
    hmrHostname: 'localhost'
};
const bundler = new Bundler('./src/client/index.html', bundlerOpts);


export function use(app){
    health(app);
    app.use(bundler.middleware());
};
