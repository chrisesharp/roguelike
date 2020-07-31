"user strict";

import express from 'express';

export default function (app, server)  {
  let router = express.Router();
  router.get('/', function (req, res, next) {
    server.reset();
    res.json({reset: "OK"});
  });

  app.use("/reset", router);
}