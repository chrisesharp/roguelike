import { Application, Router } from 'express';
import { ConnectionServer } from '../server/connection-server';
import { Server } from '../server';

export default function (app: Application, server: ConnectionServer| Server): void {
    const router = Router();
    router.put('/', function (req, res, next) { // eslint-disable-line @typescript-eslint/no-unused-vars
        server.reset();
        res.json({ reset: "OK" });
    });

    app.use("/reset", router);
}
