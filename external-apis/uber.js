var qs = require('querystring');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var async = require('async');
var parseSeconds = require('./../utils/time.js');

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
          var data = JSON.parse(body);
          data.prices.forEach(function(price) {
            price.parsedArrivalTime = parseSeconds(price.duration);
          })
          // console.log(data);
          cb(null, data);
        }).catch(function(err) {
            console.error('Error getting routes:', err);
        });
      },
      timeEstimate: function(cb) {
        request(requestUrls.urls.timeEstimate).spread(function(response, body) {
          var data = JSON.parse(body);
          data.times.forEach(function(time) {
            time.parsedDuration = parseSeconds(time.estimate);
          })
          // console.log(data);
          cb(null, data);
        }).catch(function(err) {
            console.error('Error getting routes:', err);
        });
      }
    },
    // Format results and return with callback
    function(err, results) {
      if (err) {
        callback(err);
      } else {
        var combinedResults = {};
        results.priceEstimate.prices.forEach(function(estimate) {
          var uberType = estimate.localized_display_name;
          if (!combinedResults[uberType]) {
            combinedResults[uberType] = {};
          }
          for (var property in estimate) {
            var newKey = 'price_' + property;
            combinedResults[uberType][newKey] = estimate[property];
          }
        });

        results.timeEstimate.times.forEach(function(estimate) {
          var uberType = estimate.localized_display_name;
          if (!combinedResults[uberType]) {
            combinedResults[uberType] = {};
          }
          for (var property in estimate) {
            var newKey = 'time_' + property;
            combinedResults[uberType][newKey] = estimate[property];
          }
        });
        var data = [];
        for (var uberCar in combinedResults) {
          data.push(combinedResults[uberCar])
        }

        callback(data);
      }
    });


  }

};

