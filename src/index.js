require('dotenv').config();
const express = require('express');
const app = express();

app.use(require('morgan')('dev'));
app.use(express.json());
app.use(require('cors')());

const port = process.env.PORT || 3000;
const r = module.exports.r = require('rethinkdbdash')({ db: 'minehutbans' });

app.get('/', (req, res) => res.json({ ok: true }));
app.use('/api/users', require('./routes/users.js'));
app.use('/api/blacklisted_players', require('./routes/blacklisted_players.js'));

app.listen(port, () => console.log(`minehutbans api listening on ${port}`));