var express = require('express');
var app = express();
var apiRouter = express.Router();
var bodyParser = require('body-parser')
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var calendar = google.calendar('v3');
var redis = require('redis');
var client = redis.createClient();
var jwt = require('jsonwebtoken');

client.on('connect', function() {
  console.log('connected');
})

app.use(bodyParser.json());
app.use('/api', apiRouter);
app.set('superSecret', 'anything');

var main = require('./routes/main.js')(app);
var authenticate = require('./routes/authentication')(app, apiRouter);
var api = require('./routes/api.js')(app, apiRouter, jwt);
var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log('Listening on port', port)
})

