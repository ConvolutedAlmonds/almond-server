var qs = require('querystring');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var async = require('async');

var uberApiEndpoint = 'https://api.uber.com/v1/estimates/';

/**
 * Build urls to request time and price estimates for route from Uber API
 */
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
    timeEstimate: timeEstimateUrl,
    priceEstimate: priceEstimateUrl
  };
};

module.exports = {

  /**
   * Hits Uber API for price and time estimates for route, 
   */
  getEstimates: function(origin, destination, credentials, callback) {

    var uberResults = {};
    var requestUrls = new UberEstimateUrls(origin, destination, credentials);

    async.parallel({
      priceEstimate: function(cb) {
        request(requestUrls.urls.priceEstimate).spread(function(response, body) {
          cb(null, JSON.parse(body));
        }).catch(function(err) {
            console.error('Error getting routes:', err);
        });
      },
      timeEstimate: function(cb) {
        request(requestUrls.urls.timeEstimate).spread(function(response, body) {
          cb(null, JSON.parse(body));
        }).catch(function(err) {
            console.error('Error getting routes:', err);
        });
      }
    },
    // Callback on returned reuslts
    function(err, results) {
      if (err) {
        console.log('Error collecting async results:', err);
        callback(err);
      } else {
        console.log(results);
        callback(results);
      }
    });


  }

};

