var moment = require('moment');
var timezone = require('moment-timezone');

var authorize = function(credentials, googleAuth, user, callback) {

  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  var dummyToken = "ya29.jAFsssNEDEbhxxKMm_kKoQ4EjrU8oWGPevrHxHh54vQE3iBGRO1bcm2yGRJY0cXaSy8tdGH4hhpYpw";
  var dummySecret = "1/WbQQE5-MIl1l2-cEEDt-S3m8l3ir88QeEUntrqNti3BIgOrJDtdun6zK6XiATCKT";

  oauth2Client.credentials = {
    access_token: user.attributes.accessToken,
    token_type:'Bearer',
    refresh_token: user.attributes.refreshToken,
  };

  callback(oauth2Client);
};

// Get user's calendar IDs
var getCalendarIds = function(calendar, googleAuth, credentials, user, callback) {
  var calendarIds = [];
  var calendarTasks = [];

  authorize(credentials, googleAuth, user, function(auth) {
    calendar.calendarList.list({
      auth: auth
    }, function(err, response) {

      if (err) {
        console.log('ERROR:', err)
      } else {
        console.log('calendars found');
        response.items.forEach(function(calendar) {
          if (calendar.id !== 'en.usa#holiday@group.v.calendar.google.com' && calendar.id !== '#contacts@group.v.calendar.google.com') {
            // console.log(calendar);
            calendarIds.push(calendar.id)
          }
        });

        // console.log(calendarIds);
        callback(calendarIds);
      }

    });
  });
};

// retrieve first ten events from each calendar
var makeCalendarRequests = function(calendar, calendarIds, credentials, googleAuth, user, callback) {
  var calendarEvents = [];

  var inner = function() {
    if (calendarIds.length) {

      var calendarId = calendarIds.shift();

      authorize(credentials, googleAuth, user, function(auth) {
        calendar.events.list({
          auth: auth,
          calendarId: calendarId,
          timeMin: (new Date()).toISOString(),
          timeMax: (moment().endOf('day')).toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime'
        }, function(err, response) {
          if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            inner()
          } else {
            // console.log(response);
            calendarEvents.push(response);
            inner();
          }
        });
      });

    } else {
      callback(calendarEvents);
    }
  }

  inner()
};

module.exports = {

  getAllEvents: function(calendar, googleAuth, credentials, user, callback) {
    var events = [];

    getCalendarIds(calendar, googleAuth, credentials, user, function(calendarIds) {

      makeCalendarRequests(calendar, calendarIds, credentials, googleAuth, user, function(calendarRequests) {

        calendarRequests.forEach(function(calendar) {
          var timeZone = calendar.timeZone;

          calendar.items.forEach(function(item) {

            if (!item.location) item.location = 'No location';

            if (item.start.dateTime ) {
              item.start.formattedDate = moment(item.start.dateTime).format('MMMM Do YYYY');
              item.start.formattedTime = moment(item.start.dateTime).format('h:mm a');
              item.end.formattedTime = moment(item.end.dateTime).format('h:mm a');

              item.start.zoneTime = timezone(item.start.dateTime).tz(timeZone).format('h:mm a');
              item.end.zoneTime = timezone(item.end.dateTime).tz(timeZone).format('h:mm a');
              events.push(item);
            }
          });
        });

        events.sort(function(a, b) {
          bDate = moment(b.start.dateTime || b.start.date);
          aDate = moment(a.start.dateTime || a.start.date);

          return moment(bDate).isBefore(aDate);
        });

        var monthAndDay = moment().format('MMMM Do');

        var eventsResponse = {
          events: events,
          monthAndDay: monthAndDay
        };

        callback(eventsResponse);

      });
    });
  }
};
