var qs = require('querystring');
var moment = require('moment');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var async = require('async');

var directionsApiKey = 'AIzaSyA1E7LH5MXVc6ew0fX9K6zC-xLVsCEjDXM'
var googleDirectionsEndPoint = 'https://maps.googleapis.com/maps/api/directions/json';

/**
 * Possible travel modes for Google Directions API. Only called internally from getAllRoutes.
 */
var travelModes = {
  driving: 'driving',
  walking: 'walking',
  bicycling: 'bicycling',
  transit: 'transit'
};

/**
 * Returns stringified url for the Google Directions API. Only called internally from getAllRoutes.
 * @constructor
 */
var GoogleDirectionsUrl = function(origin, destination, travelMode, arrivalTime, departureTime) {
  var urlParams = {};
  var start = 'origin=' + origin.latitude + ',' + origin.longitude;
  var end = 'destination=' + destination.latitude + ',' + destination.longitude;

  urlParams.key = directionsApiKey;
  urlParams.mode = travelMode;

  if  (arrivalTime && travelMode === 'transit') {
    urlParams.arrival_time = arrivalTime;
  } else if (departureTime && travelMode === 'transit') {
    urlParams.departure_time = departureTime
  }

  if (travelMode === 'transit') {
    urlParams.transit_mode = 'rail|bus';
    urlParams.alternatives = true;
  }

  this.url = googleDirectionsEndPoint + '?' + start + '&' + end + '&' +
    qs.stringify(urlParams);

  // this.mode = travelMode
};

var secondsToReadable = function(numSeconds) {
  var result = '';
  var duration = moment.duration(numSeconds, 'seconds');
  var hours = Math.floor(duration.asHours());
  var mins = Math.floor(duration.asMinutes()) - hours * 60;

  console.log("hours:" + hours + " mins:" + mins);

  if (hours) {
    if (hours > 1) {
      result += hours + ' hours ';
    } else {
      result += hours + ' hour '
    }
  }

  if (mins > 1) {
    result += mins + ' mins ';
  } else {
    result += mins + ' hour '
  }


  return result;
};

var createApiRequests = function(travelModes, origin, destination, arrivalTime, departureTime, callback) {
  var tasks = [];

  for (var mode in travelModes) {
    var requestUrl = new GoogleDirectionsUrl(origin, destination, travelModes[mode], arrivalTime, departureTime);

    var wrapper = function(req) {
      return function(callback) {
      request(req.url).spread(function(response, body) {
        var routes = JSON.parse(body).routes;
        var travelMode = qs.parse(response.request.path).mode;
        var firstFare = routes[0].fare;

        routes.forEach(function(route) {
          route.travelMode = travelMode;
          var leg = route.legs[0];
          var steps = leg.steps
          route.distance = leg.distance;
          route.duration = leg.duration;

          console.log('\n --- ROUTE --- \n')
          console.log(route);
          // console.log('\n++ leg ++\n');
          // console.log(leg);
          console.log('\n** STEPS **\n');
          console.log(steps);

          var modeDurations = {};

          steps.forEach(function(step) {
            if (!modeDurations[step.travel_mode]) {
              modeDurations[step.travel_mode] = 0;
            }

            modeDurations[step.travel_mode] += step.duration.value;


          });

          console.log('\n') + 
          console.log(modeDurations)
          console.log('\n');

          route.durationByMode = [];

          for (var mode in modeDurations) {
            console.log(secondsToReadable(modeDurations[mode]));
          }



        });

        /**
         * The 'transit' mode API call will return a walking route if origin and destination are two close together.
         * If this happens, the route is not returned to the client.
         */
        if (travelMode !== 'transit' || firstFare) {
            callback(null, routes);
        } else {
            callback(null, null);
        }

      }).catch(function(err) {
          console.error('Error getting routes:', err);
          callback(err, null)
      });
      }
    }
    tasks.push(wrapper(requestUrl));

  }
  return tasks;
}

/**
 * Google Directions API route fetching module
 * @module map
 */
module.exports = {

  /**
   * Required pameters are origin (address or lat/long) and destination (address or lat/long).
   * The arrival or departure time options (you can only choose one per call) are optionally available for the 'transit' travel mode.
   * NOTE: the destination can be passed in as an address on req.body.destAddress, and express middleware will convert it to the necessary longitude and latitude.
   * @param {Object} origin - The coordinates representing the user's current location.
   * @param {string} origin.longitude - The longitude of the user's current location.
   * @param {string} origin.latitude - The latitude of the user's current location.
   * @param {Object} destination - The coordinates representing the user's destination.
   * @param {string} destination.longitude - The longitude of the user's destination.
   * @param {string} destination.latitude - The latitude of the user's destination.
   */
  getAllRoutes: function(origin, destination, arrivalTime, departureTime, callback) {
    var tasks = createApiRequests(travelModes, origin, destination, arrivalTime, departureTime, callback);

    async.parallel(tasks, function(err, results) {
      if (err) {
        console.log('ERROR:', err);
        callback(err);
      } else {

        var data = {};
        data.results = results;
        if (results[3] === null) {
          data.hasTransit = false;
        } else {
          data.hasTransit = true;
          var transitRoutes = data.results[3]
          // console.log(transitRoutes);
          // transitRoutes.forEach(function(route) {
          //   console.log('\n--- ROUTE ---\n');
          //   console.log(route);

          //   console.log('\n++ LEGS ++\n');
          //   var legs = route.legs;
          //   console.log(legs);

          //   console.log('\n** STEPS **\n');
          //   var steps = legs[0].steps;
          //   console.log(steps);
          // });
        }

        // console.log(data.results);
        callback(data);
      }
    });
  }

};

