const express = require('express');
const router = module.exports = express.Router();
const mcapi = require('mcapi');
const Joi = require('joi');
const { r } = require('../index.js');
const { handleJoi } = require('../util.js');

const newBlacklistedPlayerSchema = Joi.object().keys({
  username: Joi.string().min(2).max(16).required(),
  reason: Joi.string().allow(null).max(100).required()
}).required();

router.post('/', async (req, res) => {
  if (!req.query.access || req.query.access !== process.env.ACCESS_TOKEN) return res.status(403).json({ ok: false, error: 'Invalid access token' });
  if (!handleJoi(newBlacklistedPlayerSchema, req, res)) return;
  let uuid = await mcapi.usernameToUUID(req.body.username);
  if (uuid == 'fail') return res.status(400).json({ ok: false, error: 'Invalid username' });
  let player = await r.table('blacklisted_players').get(uuid).run();
  if (player) return res.status(400).json({ ok: false, error: 'Player is already blacklisted' });
  await r.table('blacklisted_players').insert({
    id: uuid,
    username: req.body.username,
    reason: req.body.reason,
    createdAt: Date.now()
  }).run();
  res.json({ ok: true });
});

router.delete('/:uuid', async (req, res) => {
  req.params.uuid = req.params.uuid.replace(/-/g, '');
  if (!req.query.access || req.query.access !== process.env.ACCESS_TOKEN) return res.status(403).json({ ok: false, error: 'Invalid access token' });
  let player = await r.table('blacklisted_players').get(req.params.uuid).run();
  if (!player) return res.json({ ok: false, error: 'Player is not blacklisted' });
  await r.table('blacklisted_players').get(req.params.uuid).delete().run();
  res.json({ ok: true });
});

router.get('/:uuid', async (req, res) => {
  req.params.uuid = req.params.uuid.replace(/-/g, '');
  let player = await r.table('blacklisted_players').get(req.params.uuid).run();
  if (!player) return res.json({ ok: true, blacklisted: false });
  res.json({ ok: true, blacklisted: true, player });
});