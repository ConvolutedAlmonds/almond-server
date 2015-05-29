var expect = require('chai').expect;
var googleAuth = require
var userCalendar = require('./../external-apis/calendar.js');
var userMap = require('./../external-apis/map.js');

describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      expect([1,2,3].indexOf(5)).to.equal(-1);
      expect([1,2,3].indexOf(2)).to.equal(1);
    })
  })
});
