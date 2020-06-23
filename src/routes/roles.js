"user strict";

import express from 'express';

const ROLES = [
  {type:"warrior",name:"Warrior"},
  {type:"wizard",name:"Wizard"}
];

export default function (app)  {
  let router = express.Router();
  router.get('/', function (req, res, next) {
    res.json(ROLES);
  });

  app.use("/roles", router);
}