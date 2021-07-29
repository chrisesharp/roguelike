import * as routes from './routes';
import { Server, StartOpts } from './server';

export class FrontendServer extends Server {

    constructor(options:StartOpts = {}) {
        super(options);
        routes.use(this.app, options);
    }
}