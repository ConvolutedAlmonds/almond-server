var authorize = function(credentials, googleAuth, user, callback) {

  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  var dummyToken = "ya29.jAFsssNEDEbhxxKMm_kKoQ4EjrU8oWGPevrHxHh54vQE3iBGRO1bcm2yGRJY0cXaSy8tdGH4hhpYpw";
  var dummySecret = "1/WbQQE5-MIl1l2-cEEDt-S3m8l3ir88QeEUntrqNti3BIgOrJDtdun6zK6XiATCKT";

  oauth2Client.credentials = {
    access_token: user.attributes.accessToken,
    token_type:'Bearer',
    refresh_token: user.attributes.refreshToken,    
    // expiry_date: user.profile.exp
  };

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
          console.log(response);
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
          callback(response);
        }
      });
    });
  }

};
