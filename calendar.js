module.exports = function(User, nohm, calendar) {

  var credentials = require('./config.js');

  var authorize = function(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    oauth2Client.credentials = {
      access_token: token,
      token_type:'Bearer',
      refresh_token: tokenSecret,
      expiry_date: profile.exp
    };

    // console.log(oauth2Client);
    callback(oauth2Client);

  };

  var getCalendars = function(auth, callback) {
    calendar.calendarList.list({
      auth: auth
    }, function(err, response) {
      if (err) {
        console.log('ERROR:', err)
      } else {
        // console.log(response);
        callback(response);
      }
    });
  };

  // authorize(credentials, getEvents);

};
