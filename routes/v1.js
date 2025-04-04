'use strict';


import express from 'express'
const router = express.Router();

router.get('/', function (req, res, next) {
  res.json({ message: 'Hello Node.js' });
});

export default router