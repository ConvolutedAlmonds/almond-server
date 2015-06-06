var express = require('express');
var app = express();
var apiRouter = express.Router();
var bodyParser = require('body-parser')
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var calendar = google.calendar('v3');
var jwt = require('jsonwebtoken');
var passport = require('passport');
var geocoder = require('geocoder');
var async = require('async');
var credentials = require('./config.js');
var userCalendar = require('./external-apis/calendar.js');
var userMap = require('./external-apis/map.js');
var uber = require('./external-apis/uber.js');
var User = require('./db/models/user.js');

app.use(bodyParser.json());

/**
 * Cors headers
 */
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  next();
});

/**
 * Middleware to convert destination address on req.body.destination to longitude and latitude coordinates
 */
app.use(function(req, res, next) {
  if (req.body.destAddress) {

    async.parallel({
      geocode: function(cb) {
        geocoder.geocode(req.body.destAddress, function(err, data) {
          var coordinates = data.results[0].geometry;
          req.body.destination = {};
          req.body.destination.longitude = coordinates.location.lng.toString();
          req.body.destination.latitude = coordinates.location.lat.toString();
          cb(null, true)
        });
      },
      reverseGeocode: function(cb) {
        var latitude = req.body.origin.latitude;
        var longitude = req.body.origin.longitude;
        // console.log(latitude, longitude);
        geocoder.reverseGeocode(Number(latitude), Number(longitude), function(err, data) {
          if (err) console.log('error reverse geocoding', err);
          // var address = data.results[0].formatted_address;
          // console.log('reverse geocode...', data);
          req.body.origin.address = data.results[0].formatted_address;
          cb(null, true);
        })

      },
    },
      function(err, results) {
        next()
    });

  } else {
    next();
  }

});

app.get('/temp', function(req, res) {
  res.send('<!DOCTYPE html><body><a href="/auth/google">Authorize</a></body></html>')
})


// require('./auth-strategies/google-strategy.js')(passport, app, jwt, null, credentials, UserModel);
app.use('/api', apiRouter);
// app.set('superSecret', 'anything');

var main = require('./routes/main.js')(app);
// var authenticate = require('./routes/authentication')(app, apiRouter, jwt, passport);
var api = require('./routes/api.js')(app, apiRouter, null, User, userCalendar, userMap, uber, calendar, googleAuth, credentials);

var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log('Listening on port', port)
});