const express = require('express');
const app = express();

app.use(require('morgan')('dev'));
app.use(express.json());
app.use(require('cors')());

const port = process.env.PORT || 3000;
const r = module.exports.r = require('rethinkdbdash')({ db: 'minehutbans' });
const jwtKey = module.exports.jwtKey = require('fs').readFileSync('jwt.key').toString();

app.use(require('express-jwt')({ secret: jwtKey, credentialsRequired: false }), async (req, res, next) => {
  try {
    if (!req.user) return next();
    req.user = await r.table('users').get(req.user).run();
    next();
  } catch(err) {}
});

app.use('/api/users', require('./routes/users.js'));

app.listen(port, () => console.log('minehutbans api listening on ' + port));