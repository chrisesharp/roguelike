import { ConnectionServer } from './server/connection-server';
import { Server, StartOpts } from './server';
import * as routes from './routes';


export class BackendServer extends Server {
    private cs: ConnectionServer;

    constructor(options:StartOpts = {}) {
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