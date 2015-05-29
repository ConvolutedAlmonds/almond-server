module.exports = function(nohm, UserModel) {

  var redis = require('redis').createClient();

  redis.on("connect", function (err) {
    nohm.setClient(redis);

    UserModel.model = nohm.model('User', {
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
        googleTokenSecret: {
          type: 'string',
          unique: true,
          validations: [
            'notEmpty'
          ]
        }
        // googleTokenExp: {
        //   type: 'string',
        //   unique: true,
          // validations: [
          //   'notEmpty'
          // ]
        // }
      }
     });

    UserModel.methods = {

      /**
       * Takes in user's googleId (available on request obj as req.decoded)
       * Looks up user in Redis db and returns user's fields
       */
      getUser: function(googleId, callback) {
        var user = nohm.factory('User');

        UserModel.model.find({
          googleId: googleId
        }, function (err, ids) {
          if (err) {
            console.log('Error:', err)
          } else {
            console.log('Ids:', ids)
          }

          user.load(ids[0], function (err, properties) {
            if (err) {
              console.log('Error:', err)
            } else {
              callback(properties);
            }
          });
        });

      }
    }
  });
};
