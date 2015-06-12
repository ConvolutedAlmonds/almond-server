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
var async = require('async');
var credentials = require('./config.js');
var userCalendar = require('./external-apis/calendar.js');
var userMap = require('./external-apis/map.js');
var uber = require('./external-apis/uber.js');
var User = require('./db/models/user.js');
var request = require('request');
var moment = require('moment');
var getNewAccessToken = require('./utils/refresh.js');
var _ = require('underscore');

// FIX: set secret as random uuid?? Will that break jwts on server restarts?
// Set secret for jwt signing
app.set('superSecret', 'anything');

// Set middleware for request body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Set middleware for cors headers
require('./middleware/cors.js')(app);

// Set middlware for gecoding request parameters
require('./middleware/geocode.js')(app, async, _);


var port = process.env.PORT || 3000;


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

        var tokenExpirationDate = moment().add(body.expires_in, 'seconds').format();
        console.log('first token exp date', tokenExpirationDate)

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
      }
    })

    res.status(200);
    res.json({jwt: jwtToken});

  });
});



app.use('/api', apiRouter);
app.use('/cal', calRouter);




var api = require('./routes/api.js')(app, apiRouter, null, User, userCalendar, userMap, uber, calendar, googleAuth, credentials);

var authMiddleware = require('./routes/authentication')(app, calRouter, jwt);
var main = require('./routes/main.js')(app, calRouter, User, userCalendar, calendar, googleAuth, credentials, getNewAccessToken);

app.listen(port, function() {
  console.log('Listening on port', port)
});




