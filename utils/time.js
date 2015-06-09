var moment = require('moment');

/**
 * Converts number of seconds to readable format - 1 hour 23 mins, etc. 
 */
module.exports = function(numSeconds) {
  var result = '';
  var duration = moment.duration(numSeconds, 'seconds');
  var hours = Math.floor(duration.asHours());
  var mins = Math.floor(duration.asMinutes()) - hours * 60;

  if (hours) result += hours + 'h ';
  if (mins === 0) mins++;

  result += mins + 'm'

  return result;
};