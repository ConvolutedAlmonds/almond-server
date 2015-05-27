module.exports = function(nohm) {

  var redis = require('redis').createClient();

  redis.on("connect", function (err) {
    nohm.setClient(redis);
  });

  nohm.model('User', {
     properties: {
       googleId: {
         type: 'string',
         unique: true,
         validations: [
           'notEmpty'
         ]
       },
       googleToken: {
         type: 'string',
         unique: true,
         validations: [
           'notEmpty'
         ]
       },

     },
   });
};