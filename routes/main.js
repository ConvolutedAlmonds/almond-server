module.exports = function(app, router, User, userCalendar, calendar, googleAuth, credentials) {

  router.get('/events', function(req, res) {
    // res.send('Would you like some almonds?')

    var googleId = req.decoded;

    new User({
      googleId: googleId
    }).fetch().then(function(user) {
      if (!user) {
        console.log('uh oh! user not found');
        res.status(403);
        res.end();
      } else {
        userCalendar.getEvents(calendar, googleAuth, credentials, user, function(events) {
          res.status(200);
          res.json(events);
        });

      }
    })


  });


};
