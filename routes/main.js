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

        // var tokenExpDate = user.attributes.tokenExpDate; 
        // var currentDate = moment();
        // var refreshToken = user.attributes.refreshToken;

        // if (moment(currentDate).isAfter(tokenExpDate)) {
          // console.log('need new access token!');
          // getNewAccessToken(refreshToken, credentials, function(response) {

            // console.log('new access token?', response)

            userCalendar.getAllEvents(calendar, googleAuth, credentials, user, function(events) {
              res.status(200);
              res.json(events);
            });
          // })
        // }


      }
    })


  });


};
