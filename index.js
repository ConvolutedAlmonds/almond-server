var express = require('express');
var app = express();
var apiRouter = express.Router();
var bodyParser = require('body-parser')
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var calendar = google.calendar('v3');
var jwt = require('jsonwebtoken');
var passport = require('passport');
var credentials = require('./config.js');
var userCalendar = require('./external-apis/calendar.js');
var userMap = require('./external-apis/map.js');
var uber = require('./external-apis/uber.js');

var hrLocation = {
  longitude: -122.408978,
  latitude: 37.783970
};

var myHouse = {
  longitude: -122.449582,
  latitude: 37.710943
};

// uber.getUberEstimates(hrLocation, myHouse, credentials);

var UserModel = {};

var nohm = require('nohm').Nohm;
require('./db/db-config.js')(nohm, UserModel);

app.get('/temp', function(req, res) {
  res.send('<!DOCTYPE html><body><a href="/auth/google">Authorize</a></body></html>')
})

app.use(passport.initialize());

app.use(bodyParser.json());
require('./auth-strategies/google-strategy.js')(passport, app, jwt, nohm, credentials);
app.use('/api', apiRouter);
app.set('superSecret', 'anything');

var main = require('./routes/main.js')(app);
var authenticate = require('./routes/authentication')(app, apiRouter, jwt, passport);
var api = require('./routes/api.js')(app, apiRouter, nohm, UserModel, userCalendar, userMap, uber, calendar, googleAuth, credentials);

var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log('Listening on port', port)
})



// var test = require('./test/server-spec.js')();