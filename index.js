var express = require('express');
var app = express();
var apiRouter = express.Router();
var bodyParser = require('body-parser')
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var calendar = google.calendar('v3');
var jwt = require('jsonwebtoken');
var passport = require('passport');

var nohm = require('nohm').Nohm;
var db = require('./db/db-config.js')(nohm);

app.get('/temp', function(req, res) {
  res.send('<!DOCTYPE html><body><a href="/auth/google">Authorize</a></body></html>')
})

app.use(passport.initialize());

app.use(bodyParser.json());
require('./auth-strategies/google-strategy.js')(passport, app, jwt, nohm);

app.use('/api', apiRouter);
app.set('superSecret', 'anything');

var main = require('./routes/main.js')(app);
var authenticate = require('./routes/authentication')(app, apiRouter, jwt, passport);
var api = require('./routes/api.js')(app, apiRouter);
var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log('Listening on port', port)
})

