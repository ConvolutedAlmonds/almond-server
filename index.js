var express = require('express');
var app = express();
var apiRouter = express.Router();
var calRouter = express.Router();
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
var moment = require('moment');
var getNewAccessToken = require('./utils/refresh.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('superSecret', 'anything');

var port = process.env.PORT || 3000;

/**
 * Cors headers
 */
app.use(function(req, res, next) {

  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-Access-Token, X-HTTP-Method-Override, Content-Type, Accept, Authorization');
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
        geocoder.reverseGeocode(Number(latitude), Number(longitude), function(err, data) {
          if (err) console.log('error reverse geocoding', err);
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

var parseGoogleJwt = function(googleJwt) {
  var parts = googleJwt.split('.');
  var headerBuf = new Buffer(parts[0], 'base64');
  var bodyBuf = new Buffer(parts[1], 'base64');
  var header = JSON.parse(headerBuf.toString());
  var body = JSON.parse(bodyBuf.toString());

  return body.sub;
}

app.get('/auth/code', function(req, res) {
  console.log('code', req.query.code);

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
    // console.log('body:', body);

    body = JSON.parse(body);

    var userId = parseGoogleJwt(body.id_token);

    var jwtToken = jwt.sign(userId, app.get('superSecret'), {
      expiresInMinutes: 1440 // expires in 24 hours
    });

    console.log('responding with jwt');
    console.log(jwtToken);

    new User({
      googleId: userId
    }).fetch().then(function(user) {
      if (!user) {
        console.log('new user');

        var tokenExpirationDate = moment().add(body.expires_in, 'seconds');

        new User({
          googleId: userId,
          accessToken: body.access_token,
          refreshToken: body.refresh_token,
          secondsValid: body.expires_in,
          tokenExpDate: tokenExpirationDate
        }).save().then(function(user) {
          console.log('New user saved!', user)
        });

      } else {
        console.log('user already exists')
        user.save({
          accessToken: body.access_token,
          refreshToken: body.refresh_token,
          secondsValid: body.expires_in,
          tokenExpDate: tokenExpirationDate
        }).then(function(user) {
          console.log('User updated')
        })
      }
    })

    res.status(200);
    res.json({jwt: jwtToken});

  });
});



// require('./auth-strategies/google-strategy.js')(passport, app, jwt, null, credentials, UserModel);
app.use('/api', apiRouter);
app.use('/cal', calRouter);

var api = require('./routes/api.js')(app, apiRouter, null, User, userCalendar, userMap, uber, calendar, googleAuth, credentials);
var authenticate = require('./routes/authentication')(app, calRouter, jwt);
var main = require('./routes/main.js')(app, calRouter, User, userCalendar, calendar, googleAuth, credentials, getNewAccessToken);

app.listen(port, function() {
  console.log('Listening on port', port)
});




