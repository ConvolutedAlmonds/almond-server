var geocoder = require('geocoder');

module.exports = function(app, async, _) {

/**
 * Middleware to convert destination address on req.body.destination to longitude and latitude coordinates
 */
app.use(function(req, res, next) {


  if (req.body.destAddress) {

    async.parallel({
      geocode: function(cb) {
        geocoder.geocode(req.body.destAddress, function(err, data) {

          if (err || !data.results[0] || isProbablyWrong) {
            // console.log('error geocoding:', err)
            cb(true, null);
          } else {

            var isProbablyWrong = _.contains(data.results[0].types, 'subpremise');

            if (isProbablyWrong) {
              cb(true, null);
            } else {
              // console.log('Geocode results:', data.results[0])
              var coordinates = data.results[0].geometry;
              req.body.destination = {};
              req.body.destination.longitude = coordinates.location.lng.toString();
              req.body.destination.latitude = coordinates.location.lat.toString();
              cb(null, true);
            }
          }
        });
      },
      reverseGeocode: function(cb) {
        var latitude = req.body.origin.latitude;
        var longitude = req.body.origin.longitude;
        geocoder.reverseGeocode(Number(latitude), Number(longitude), function(err, data) {
          if (err) {
            // console.log('error reverse geocoding', err);
            cb(err, null);
          } else {
            // console.log('reverseGeocode results:', data)
            req.body.origin.address = data.results[0].formatted_address;
            cb(null, true);
          }
        })

      },
    },
      function(err, results) {
        // console.log('geocode final error:', err);
        // console.log('geocode final results:', results);
        if (err) {
          res.status(400);
          res.end()
        } else {
          next()

        }
    });

  } else {
    next();
  }

});

};
