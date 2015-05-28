module.exports = function(nohm, userModel) {

  var redis = require('redis').createClient();

  redis.on("connect", function (err) {
    nohm.setClient(redis);

    var User = nohm.model('User', {
      properties: {
        googleId: {
          type: 'string',
          unique: true,
          // validations: [
          //   'notEmpty'
          // ]
        },
        googleToken: {
          type: 'string',
          unique: true,
          // validations: [
          //   'notEmpty'
          // ]
        },
        googleTokenSecret: {
          type: 'string',
          unique: true,
          // validations: [
          //   'notEmpty'
          // ]
        },
        googleTokenExp: {
          type: 'string',
          unique: true,
          // validations: [
          //   'notEmpty'
          // ]
        }
      }
     });
 
     userModel = User;
  });
};
