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

  var timeEstimateUrl = uberApiEndpoint + 'time?' + qs.stringify(timeEstimateParams);
  var priceEstimateUrl = uberApiEndpoint + 'price?' + qs.stringify(priceEstimateParams);

  this.urls = {
    timeEstimateUrl: timeEstimateUrl,
    priceEstimateUrl: priceEstimateUrl
  };
};

module.exports = {

  getUberEstimates: function(origin, destination, credentials) {

    var requestUrls = new UberEstimateUrls(origin, destination, credentials);
    console.log(requestUrls.urls.timeEstimateUrl)
    console.log(requestUrls.urls.priceEstimateUrl)

    request(requestUrls.urls.priceEstimateUrl).spread(function(response, body) {
        console.log('Body:', body);
    }).catch(function(err) {
        console.error('Error getting routes:', err);
    });
  }

};
