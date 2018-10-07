const express = require('express');
const router = module.exports = express.Router();
const mcapi = require('mcapi');
const jwt = require('jsonwebtoken');
const { jwtKey, r } = require('../index.js');

router.post('/', async (req, res) => {
  if (!req.query.code || req.query.code.length !== 6) return res.status(400).json({ ok: false, errors: ['Invalid code'] })
  let uuid = await mcapi.oAuthToUUID(req.query.code);
  console.log(uuid);
  if (uuid == 'fail') return res.status(400).json({ ok: false, errors: ['Invalid code'] })
  let user = await r.table('users').get(uuid).run();
  let username = await mcapi.uuidToUsername(uuid);
  if (!user) {
    await r.table('users').insert({
      id: uuid,
      username,
      createdAt: Date.now(),
      staff: false
    }).run();
  } else await r.table('users').get(uuid).update({ username }).run();
  let token = await jwt.sign(uuid, jwtKey);
  res.json({ ok: true, token });
});

router.get('/@me', async (req, res) => {
  if (!req.user) return res.status(401).json({ ok: false, errors: ['Not logged in'] });
  res.json({ user: req.user });
});