var authorize = function(credentials, googleAuth, user, callback) {

  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  var dummyToken = 'ya29.igEeqN4EBstMBTpOTf8wMqdVChC5r16SC15Nhf__tMb-swQhh87PSnYsCHqqRxc4auAahyTvRyWGXg';
  var dummySecret = '1/MU3HvAMTQQQ3SNVi87jNEhi6Ro_iD6B4WNEgRlNLcEE';

  oauth2Client.credentials = {
    // access_token: user.googleToken,
    access_token: dummyToken,
    token_type:'Bearer',
    // refresh_token: user.googleTokenSecret,
    refresh_token: dummySecret
    
    // expiry_date: user.profile.exp
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
          console.log(response);
          callback(response);
        }
      });
    })
  },

  getEvents: function(calendar, googleAuth, credentials, user, callback) {

    // console.log('Credentials:', credentials);
    authorize(credentials, googleAuth, user, function(auth) {
      // console.log('Auth:', auth)
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
