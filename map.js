var qs = require('querystring');
var moment = require('moment');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

var directionsApiKey = 'AIzaSyA1E7LH5MXVc6ew0fX9K6zC-xLVsCEjDXM'
var googleDirectionsEndPoint = 'https://maps.googleapis.com/maps/api/directions/json';

// var myHouse = '175 Rae Avenue, San Francisco, CA 94112';
// var hrAddress ='944 Market Street #8, San Francisco, CA 94102';
// var twentyFour = '45 Montgomery Street, San Francisco, CA 94101';
// var arrivalTime = parseInt((moment().add(1, 'hour').valueOf()) / 1000);

/**
 * Possible travel modes for Google Directions API
 */
var travelModes = {
  driving: 'driving',
  walking: 'walking',
  bicycling: 'bicycling',
  transit: 'transit'
};

module.exports = {

  /**
   * Returns qs.stringified Google Directions API request url
   * Subordinate function- see getAllRoutes below
   */
  GoogleDirectionsUrl: function(origin, destination, travelMode, arrivalTime, departureTime) {
    var urlParams = {};

    urlParams.key =  directionsApiKey;
    urlParams.origin = origin;
    urlParams.destination = destination;
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

    this.url = googleDirectionsEndPoint + '?' +
      qs.stringify(urlParams);
  }

};

