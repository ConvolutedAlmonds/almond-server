var qs = require('querystring');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var uberApiEndpoint = 'https://api.uber.com/v1/estimates/';

var UberEstimateUrls = function(origin, destination, credentials) {
    var timeEstimateParams = {
      server_token: credentials.uber.server_token,
      start_longitude: origin.longitude,
      start_latitude: origin.latitude
    };

    var priceEstimateParams = {
      server_token: credentials.uber.server_token,
      start_longitude: origin.longitude,
      start_latitude: origin.latitude,
      end_longitude: destination.longitude,
      end_latitude: destination.latitude
    };

  
};

