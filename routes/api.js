module.exports = function(app, router, nohm, UserModel, userCalendar, userMap, uber, calendar, googleAuth, credentials) {

  /**
   * Takes in user's googleId (available on request obj as req.decoded)
   * Looks up user in Redis db and returns user's fields
   */
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

  /**
   * Returns all Google Calendar events (for a specific calendar) to the client via JSON
   */
  router.get('/upcomingEvents', function(req, res) {

    var googleId = req.decoded;

    retrieveUser(googleId, function(user) {
      userCalendar.getEvents(calendar, googleAuth, credentials, user, function(events) {
        res.status(200);
        res.json({events: events});
      });
    });
  });

  /**
   * Returns all Google Directions API routes via JSON to the client.
   * Request needs at least origin and destination parameters, which much be addresses or long/lat coordinates.
   * Request body can also include a departure or arrival time (only applied to 'transit' route modes) - in # seconds
   * since epoch time
   */
  router.post('/routes', function(req, res) {
    var origin = req.body.origin;
    var destination = req.body.destination;
    var arrivalTime = req.body.arrivalTime;
    var departureTime = req.body.departureTime;

    userMap.getAllRoutes(origin, destination, arrivalTime, departureTime, function(routes) {
      // console.log('Routes:', routes);
      res.status(200);
      res.json({routes: routes})
    });
  });

  /**
   * Returns price and time estimates from Uber API via JSON to the client.
   * Request needs origin and destination params, each an object with .longitude and .latitude properties
   */
  router.post('/uberEstimates', function(req, res) {
    var origin = req.body.origin;
    var destination = req.body.destination;

    uber.getEstimates(origin, destination, credentials, function(estimates) {
      // console.log('Estimates:', estimates);
      res.status(200);
      res.json({estimates: estimates});

    })
  })

};
