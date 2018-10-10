const express = require('express');
const router = module.exports = express.Router();
const mcapi = require('mcapi');
const Joi = require('joi');
const { jwtKey, r } = require('../index.js');
const { handleJoi } = require('../util.js');
const { accessToken } = require('../../config.json');

const newBlacklistedPlayerSchema = Joi.object().required().keys({
  username: Joi.string().min(2).max(16).required(),
  reason: Joi.string().allow(null).max(100).required()
});

router.post('/', async (req, res) => {
  if (!req.query.access || req.query.access !== accessToken) return res.status(req.query.access ? 403 : 401).json({ ok: false, errors: ['Invalid access token'] });
  if (!handleJoi(newBlacklistedPlayerSchema, req, res)) return;
  let uuid = await mcapi.usernameToUUID(req.body.username);
  if (uuid == 'fail') return res.status(400).json({ ok: false, errors: ['Invalid username'] });
  let player = await r.table('blacklisted_players').get(uuid).run();
  if (player) return res.status(400).json({ ok: false, errors: ['Player is already blacklisted'] });
  await r.table('blacklisted_players').insert({
    id: uuid,
    username: req.body.username,
    reason: req.body.reason,
    createdAt: Date.now()
  }).run();
  res.json({ ok: true });
});

router.delete('/:uuid', async (req, res) => {
  if (!req.query.access || req.query.access !== accessToken) return res.status(req.query.access ? 403 : 401).json({ ok: false, errors: ['Invalid access token'] });
  let player = await r.table('blacklisted_players').get(req.params.uuid).run();
  if (!player) return res.status(404).json({ ok: false, errors: ['Player is not blacklisted'] });
  await r.table('blacklisted_players').get(req.params.uuid).delete().run();
  res.json({ ok: true });
});

router.get('/:uuid', async (req, res) => {
  let player = await r.table('blacklisted_players').get(req.params.uuid).run();
  if (!player) return res.status(404).json({ ok: false, blacklisted: false, errors: ['Player is not blacklisted'] });
  res.json({ ok: true, blacklisted: true, player });
});