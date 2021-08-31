import { Application, Router } from 'express';
import { Players } from '../server/entities';

interface Role {
  type: string;
  name: string;
}

const ROLES: Role[] = [];
for (const key in Players) {
  const role = key.toString()
  const Role = role.charAt(0).toUpperCase() + role.substring(1);
  ROLES.push({type:role, name:Role})
}

ROLES.push({type: "spectator", name: "Spectator"});

export default function (app: Application): void {
  const router = Router();
  router.get('/', function (req, res, next) { // eslint-disable-line @typescript-eslint/no-unused-vars
    res.json(ROLES);
  });

  app.use("/roles", router);
}