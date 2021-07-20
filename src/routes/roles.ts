import { Application, Router } from 'express';
import { Players } from '../server/entities';

interface Role {
  type: string;
  name: string;
}

const ROLES: Role[] = [];

for (const key in Players) {
  const ctor = Players[key];
  const Role = ctor.toString().split(' ')[1];
  const role = Role.charAt(0).toLowerCase() + Role.substring(1);
  ROLES.push({type:role, name:Role})
}

export default function (app: Application): void {
  const router = Router();
  router.get('/', function (req, res, next) { // eslint-disable-line @typescript-eslint/no-unused-vars
    res.json(ROLES);
  });

  app.use("/roles", router);
}