module.exports = function() {

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

  
};

