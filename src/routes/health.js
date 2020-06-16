"user strict";

import express from 'express';

export default function (app)  {
  let router = express.Router();
  router.get('/', function (req, res, next) {
    res.json({status: 'UP'});
  });

  app.use("/health", router);
}