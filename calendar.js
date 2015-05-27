module.exports = function(User, nohm) {

  var credentials = require('./config.js');

   var dummyGoogleId = '104821056270933164941';

    setTimeout(function() {
      var user = nohm.factory('User');
      
        User.find({
          googleId: dummyGoogleId
        }, function (err, ids) {
          if (err) {
            console.log('Error:', err)
          } else {
            console.log('Ids:', ids)
          }

          user.load(ids[0], function (err, properties) {
            if (err) {
              console.log('Error:', err)
            } else {
              console.log(properties);
            }
          });
        });

    }, 1000)
    



 


  

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

    console.log(oauth2Client);
    callback(oauth2Client);

  }

  var getEvents = function(auth) {
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
      }
      var events = response.items;
      if (events.length == 0) {
        console.log('No upcoming events found.');
      } else {
        console.log('Upcoming 10 events:');
        for (var i = 0; i < events.length; i++) {
          var event = events[i];
          var start = event.start.dateTime || event.start.date;
          console.log('%s - %s', start, JSON.stringify(event.summary));
        }
      }
    });
  }

  // authorize(credentials, getEvents);

};
