module.exports = function(app, router, nohm, UserModel, userCalendar, userMap, calendar, googleAuth, credentials) {


  var retrieveUser = function(googleId, callback) {
    var user = nohm.factory('User');

    UserModel.model.find({
      googleId: googleId
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
          callback(properties);
        }
      });
    });
  };

  router.get('/upcomingEvents', function(req, res) {

    var googleId = req.decoded;

    retrieveUser(googleId, function(user) {
      userCalendar.getEvents(calendar, googleAuth, credentials, user, function(events) {
        res.status(200);
        res.json({events: events});
      })
    });

  });

  router.post('/routes', function(req, res) {
    var origin = req.body.origin;
    var destination = req.body.destination;
    var arrivalTime = req.body.arrivalTime;
    var departureTime = req.body.departureTime;

    res.status(200);
    userMap.getAllRoutes(origin, destination, arrivalTime, departureTime, function(routes) {
      console.log('Routes:', routes);
    })
    res.json({response: 'success'})
  })

};
