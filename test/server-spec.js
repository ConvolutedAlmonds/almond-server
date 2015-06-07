var expect = require('chai').expect;
var request = require('request');
var jwt = require('jsonwebtoken');
var userCalendar = require('./../external-apis/calendar.js');
var userMap = require('./../external-apis/map.js');

var TestUserModel = {};

describe('Server test -- ', function() {

  before(function(done) {    
    setTimeout(function(){
      done();
    }, 1000);
  });

  describe('Route authentication:', function(){

    describe('authenticated api request to /api/routes', function(){
      it('should return a status code of 200', function(done){
        var options = {
          url: 'http://localhost:3000/api/routes',
          method: 'POST',
          'Content-Type': 'X-www-form-urlencoded',
          form: {
                  'origin': {
                    'longitude': 5,
                    'latitude': 5
                  },
                  'destAddress': '944 Market Street San Francisco, CA'
                },
        };

        request(options, function(error, res, body) {
          expect(res.statusCode).to.equal(200);
          done();
        });
      });
    });


    describe('Authenticated api request to /api/uberEstimates', function(){
      it('should return a status code of 200', function(done){
        var options = {
          url: 'http://localhost:3000/api/routes',
          method: 'POST',
          'Content-Type': 'X-www-form-urlencoded',
          form: {
            'origin': {
              'longitude': 5,
              'latitude': 5
            },
            'destAddress': '944 Market Street San Francisco, CA'
          },
        };

        request(options, function(error, res, body) {
          expect(res.statusCode).to.equal(200);
          done();
        });
      });
    });

  });


  describe('User models', function() {

    xdescribe('New users should be saved', function(){
      it('should do something', function(done){
        // request('http://localhost:3000/api/uberEstimates', function(error, res, body) {
          expect(true).to.equal(false);
          done();
        // });
      });
    });

  });

});
