import { Application, Router } from 'express';

export default function (app: Application): void {
    const router = Router();
    router.get('/', function (req, res) {
        res.json({ status: 'UP' });
    });

    app.use("/health", router);
}