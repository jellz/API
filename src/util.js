const Joi = require('joi');

exports.handleJoi = (schema, req, res) => {
  let result = Joi.validate(req.body, schema);
  if (result.error) {
    if (!result.error.isJoi) {
      console.error(`Error while running Joi at ${Date.now()}: ${result.error}`);
      res.sendStatus(500);
      return false;
    }
    res.status(400).json({ ok: false, errors: result.error.details.map(item => item.message) });
    return false;
  } else return true;
}