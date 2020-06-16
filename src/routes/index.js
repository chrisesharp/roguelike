"user strict";

import Bundler from 'parcel-bundler';
// import map from './map.js';
import health from './health.js';

const bundler = new Bundler('./src/client/index.html');

export function use(app){
    // map(app);
    health(app);
    app.use(bundler.middleware());
};
