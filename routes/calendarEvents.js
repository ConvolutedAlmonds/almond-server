var moment = require('moment');

module.exports = function(app, router, User, userCalendar, calendar, googleAuth, credentials, getNewAccessToken) {

  router.get('/events', function(req, res) {

    var googleId = req.decoded;

    new User({
      googleId: googleId
    }).fetch().then(function(user) {
      if (!user) {

        console.log('uh oh! user not found');
        res.status(403);
        res.end();

      } else {

        // console.log(user.attributes);

        var tokenExpDate = user.attributes.tokenExpDate; 
        var refreshToken = user.attributes.refreshToken;

        console.log('checking access_token expiration');
        console.log(moment().format());
        console.log('is after?')
        console.log(tokenExpDate)

        if (moment().isAfter(tokenExpDate)) {
          console.log('need new access token!');
          getNewAccessToken(refreshToken, credentials, function(err, response) {
            if (err) console.log('Error refreshing token:', err);
            console.log('response', response);

            response = JSON.parse(response);
            console.log('new access token?', response.access_token)
            tokenExpirationDate = moment().add(response.expires_in, 'seconds').format();

            user.save({
              accessToken: response.access_token ,
              secondsValid: response.expires_in,
              tokenExpDate: tokenExpirationDate
            }).then(function(user) {
              console.log('New access token saved', user)
              userCalendar.getAllEvents(calendar, googleAuth, credentials, user, function(events) {
                ('success! responding with events and access_token refreshed');
                res.status(200);
                res.json(events);
              });
            });

          })
        } else {
          userCalendar.getAllEvents(calendar, googleAuth, credentials, user, function(events) {
            console.log('success! responding with events');
            res.status(200);
            res.json(events);
          });
        }


      }
    })


  });


};
