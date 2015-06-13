var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

/**
 * Exchanges auth code from client for refresh token and access token
 */
module.exports = function(refreshToken, credentials, callback) {
  var refreshEndpoint = 'https://www.googleapis.com/oauth2/v3/token';

  console.log(credentials.installed.client_secret, credentials.installed.client_id, refreshToken)

  var refreshUrl = refreshEndpoint + '?' +
    'refresh_token=' + refreshToken +
    '&client_secret=' + credentials.installed.client_secret +
    '&client_id=' + credentials.installed.client_id +
    '&grant_type=refresh_token';

  request.post(refreshUrl, function (err, httpResponse, body) {
    callback(err, body)
  })

};
