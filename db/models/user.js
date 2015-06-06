var db = require('../db-config.js');
var uuid = require('node-uuid');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  initialize: function() {
    var randomId = uuid.v4();
  }
});

module.exports = db.model('User', User);

