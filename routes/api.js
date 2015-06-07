module.exports = function(app, router, nohm, UserModel, userCalendar, userMap, uber, calendar, googleAuth, credentials) {

  /**
   * Returns all Google Calendar events (for a specific calendar) to the client via JSON
   */
  router.get('/upcomingEvents', function(req, res) {

    var googleId = req.decoded;

    UserModel.methods.getUser(googleId, function(user) {
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
    console.log(req);
    var origin = req.body.origin;
    console.log(origin);
    var destination = req.body.destination;
    var arrivalTime = req.body.arrivalTime;
    var departureTime = req.body.departureTime;

    userMap.getAllRoutes(origin, destination, arrivalTime, departureTime, function(data) {
      // console.log('Routes:', routes);
      res.status(200);
      res.json({data: data})
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
