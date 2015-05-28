var authorize = function(credentials, googleAuth, callback) {

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


module.exports = {

  getCalendars: function(calendar, googleAuth, credentials, user, callback) {

    authorize(credentials, googleAuth, user, function(auth) {
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
    })
  },

  getEvents: function(calendar, googleAuth, credentials, user, callback) {
    authorize(credentials, googleAuth, user, function(auth) {
      calendar.events.list({
        auth: auth,
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
      }, function(err, response) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        } else {
          // console.log(response);
          callback(response);
        }
      });
    });
  }

};
