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
      console.log('User props:', user);

      userCalendar.getEvents(calendar, googleAuth, credentials, user, function(events) {
        console.log('\n***** EVENTS *****\n');
        console.log(events);
        res.json({events: events});
        res.status(200);
      })
    })


     
  })

  router.get('/routes', function(req, res) {
    console.log("Routes");
    res.status(200);
    res.json({response: 'success'})
  })

};
