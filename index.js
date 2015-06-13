var express = require('express');
var app = express();
var apiRouter = express.Router();
var calRouter = express.Router();
var authRouter = express.Router();
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

var port = process.env.PORT || 3000;

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

// Setup routers for travel data, calendar events, and authentication code exchange
app.use('/api', apiRouter);
app.use('/cal', calRouter);
app.use('/auth', authRouter);

// Set route for exchanging authorization code client side Google OAuth for jwt tokens
// Attaches any decoded Google ID on req.decoded
var authExchange = require('./routes/authExchange.js')(app, authRouter, credentials, request, User, jwt);

// Set route for returning travel data to client
var api = require('./routes/api.js')(app, apiRouter, null, User, userCalendar, userMap, uber, calendar, googleAuth, credentials);

// Set authentication middleware to protect following Calendar route from clients without verified jwt tokens
var authMiddleware = require('./middleware/authentication')(app, calRouter, jwt);

// Set route for returning user's calendar events to client
var main = require('./routes/main.js')(app, calRouter, User, userCalendar, calendar, googleAuth, credentials, getNewAccessToken);

app.listen(port, function() {
  console.log('Listening on port', port)
});




