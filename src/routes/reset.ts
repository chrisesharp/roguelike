import { Application, Router } from 'express';
import { ConnectionServer } from '../server/connection-server';

export default function (app: Application, server: ConnectionServer): void {
    const router = Router();
    router.get('/', function (req, res, next) { // eslint-disable-line @typescript-eslint/no-unused-vars
        server.reset();
        res.json({ reset: "OK" });
    });

    app.use("/reset", router);
}
