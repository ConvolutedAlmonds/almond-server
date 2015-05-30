var qs = require('querystring');
var moment = require('moment');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

var directionsApiKey = 'AIzaSyA1E7LH5MXVc6ew0fX9K6zC-xLVsCEjDXM'
var googleDirectionsEndPoint = 'https://maps.googleapis.com/maps/api/directions/json';

/**
 * Possible travel modes for Google Directions API
 */
var travelModes = {
  driving: 'driving',
  walking: 'walking',
  bicycling: 'bicycling',
  transit: 'transit'
};

/**
 * Returns qs.stringified Google Directions API request url
 * Subordinate function- see getAllRoutes below
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
};

module.exports = {

  /**
   * Required pameters are origin (address or lat/long) and destination (address or lat/long)
   * The arrival or departure time options (you can only choose one per call) are optionally
   * available for the 'transit' travel mode
   */
  getAllRoutes: function(origin, destination, arrivalTime, departureTime, callback) {

    var apiRoutes = {};
    apiRoutes.modes = [];

    for (var mode in travelModes) {

        var requestUrl = new GoogleDirectionsUrl(origin, destination, travelModes[mode], arrivalTime, departureTime);
        console.log(requestUrl);
        request(requestUrl).spread(function(response, body) {
            var routes = JSON.parse(body).routes[0];
            apiRoutes.modes.push(routes);
        }).catch(function(err) {
            console.error('Error getting routes:', err);
        });
    }

    var waitForApiResponses = function() {
      setTimeout(function() {
        if (apiRoutes.modes.length === 4) {
          callback(apiRoutes);
        } else {
          waitForApiResponses();
        }
      }, 100);
    };

    waitForApiResponses();
  }


};

