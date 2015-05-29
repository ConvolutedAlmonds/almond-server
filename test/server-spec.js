var expect = require('chai').expect;
var request = require('request');
var userCalendar = require('./../external-apis/calendar.js');
var userMap = require('./../external-apis/map.js');

describe('Route authentication', function(){

  before(function(done) {    
    setTimeout(function(){
      done();
    }, 1000);
  });

  describe('Unauthenticated api request to /api/upcomingEvents', function(){
    it('should return a status code of 403', function(done){
      request('http://localhost:3000/api/upcomingEvents', function(error, res, body) {
        expect(res.statusCode).to.equal(403);
        done();
      });
    });
  });

  describe('Authenticated api request to /api/upcomingEvents', function(){
    it('should return a status code of 200', function(done){
      request('http://localhost:3000/api/upcomingEvents', function(error, res, body) {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });

  describe('Unauthenticated api request to /api/routes', function(){
    it('should return a status code of 403', function(done){
      request('http://localhost:3000/api/routes', function(error, res, body) {
        expect(res.statusCode).to.equal(403);
        done();
      });
    });
  });

  describe('Unauthenticated api request to /api/routes', function(){
    it('should return a status code of 200', function(done){
      request('http://localhost:3000/api/routes', function(error, res, body) {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });

  describe('Unauthenticated api request to /api/uberEstimates', function(){
    it('should return a status code of 403', function(done){
      request('http://localhost:3000/api/uberEstimates', function(error, res, body) {
        expect(res.statusCode).to.equal(403);
        done();
      });
    });
  });

  describe('Unauthenticated api request to /api/uberEstimates', function(){
    it('should return a status code of 200', function(done){
      request('http://localhost:3000/api/uberEstimates', function(error, res, body) {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });

});
