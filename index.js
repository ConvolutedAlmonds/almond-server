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
var request = require('request');

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
  res.send('<!DOCTYPE html><body><a href="/auth/dummy">Authorize</a></body></html>')
})

var scope = 'https://www.googleapis.com/auth/plus.login';

var authUrl = 'https://accounts.google.com/o/oauth2/auth?client_id=' + credentials.installed.client_id + '&redirect_uri=http://localhost/callback&scope=https://www.googleapis.com/auth/plus.login&approval_prompt=force&response_type=code&access_type=offline'

// app.get('/auth/dummy', function(req, res) {
  
//   request(authUrl, function(error, response, body) {
//     console.log('request auth code');
//     if (error) console.log(error);
//     res.send(body);
//     // console.log('Body', body);
//   })
// })

app.get('/auth/code', function(req, res) {
  // console.log('code', req.query.code);
  // console.log('client_id', credentials.installed.client_id);
  // console.log('client_secret', credentials.installed.client_secret);

  var code = req.query.code || '4/bIpLbbfrtcXw4cwdXMXrIWQJizhPjUggK_jbNmiM0uc.0u9pik9gXK4QEnp6UAPFm0E02rd3mwI';

  var url = 'https://accounts.google.com/o/oauth2/token';
  var payload = {
    grant_type: 'authorization_code',
    code: code,
    client_id: credentials.installed.client_id,
    client_secret: credentials.installed.client_secret,
    redirect_uri: 'http://localhost/callback'
  };

  request.post(url, { form: payload }, function(error, response, body) {
    if (error) console.log('error using auth code:', error)
    console.log(body);

    request('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + body.access_token, function(error, response, body) {
      if (error) console.log('error retrieving user info:', error);
      console.log('user info:', body);
    })

  });
});



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