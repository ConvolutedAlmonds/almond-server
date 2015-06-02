var qs = require('querystring');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var uberApiEndpoint = 'https://api.uber.com/v1/estimates/';

var UberEstimateUrls = function(origin, destination, credentials) {
  // console.log(credentials);

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
    timeEstimate: timeEstimateUrl,
    priceEstimate: priceEstimateUrl
  };
};

module.exports = {

  getEstimates: function(origin, destination, credentials, callback) {

    var uberResults = {};

    var requestUrls = new UberEstimateUrls(origin, destination, credentials);
    // console.log(requestUrls.urls.timeEstimate);
    // console.log(requestUrls.urls.priceEstimate);

    request(requestUrls.urls.priceEstimate).spread(function(response, body) {
      uberResults.priceEstimate = body;
    }).catch(function(err) {
        console.error('Error getting routes:', err);
    });

    request(requestUrls.urls.timeEstimate).spread(function(response, body) {
      uberResults.timeEstimate = body;
    }).catch(function(err) {
        console.error('Error getting routes:', err);
    });

    var waitForApiResponses = function() {
      setTimeout(function() {
        if (Object.keys(uberResults).length === 2) {
          // console.log('\n RESULTS RETURNED\n');
          // console.log(uberResults);
          callback(uberResults);
        } else {
          waitForApiResponses();
        }
      }, 100);
    };

    waitForApiResponses()
  }

};

