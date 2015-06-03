// module.exports = function(nohm, UserModel) {

//   var redis = require('redis').createClient();

//   redis.on("connect", function (err) {
//     nohm.setClient(redis);

//     UserModel.model = nohm.model('User', {
//       properties: {
//         googleId: {
//           type: 'string',
//           unique: true,
//           validations: [
//             'notEmpty'
//           ]
//         },
//         googleToken: {
//           type: 'string',
//           unique: true,
//           validations: [
//             'notEmpty'
//           ]
//         },
//         googleTokenSecret: {
//           type: 'string',
//           unique: true,
//           validations: [
//             'notEmpty'
//           ]
//         }
//         // googleTokenExp: {
//         //   type: 'string',
//         //   unique: true,
//           // validations: [
//           //   'notEmpty'
//           // ]
//         // }
//       }
//      });

//     UserModel.methods = {

//       /**
//        * Takes in user's googleId (available on request obj as req.decoded)
//        * Looks up user in Redis db and returns user's fields
//        */
//       getUser: function(googleId, callback) {
//         var user = nohm.factory('User');

//         UserModel.model.find({
//           googleId: googleId
//         }, function (err, ids) {
//           if (err) {
//             console.log('Error:', err)
//           } else {
//             console.log('Ids:', ids)
//           }

//           user.load(ids[0], function (err, properties) {
//             if (err) {
//               console.log('Error:', err)
//             } else {
//               callback(properties);
//             }
//           });
//         });

//       },


//       *
//        * Takes in user's googleId
//        * Deletes users from database
       
//       deleteUser: function(googleId, callback) {

//         UserModel.model.find({
//           googleId: googleId
//         }, function (err, ids) {
//           if (err) {
//             console.log('Error:', err)
//           } else {
//             console.log('Ids:', ids)
//           }

//           var user = nohm.factory('User', ids[0], function (err) {
//             if (err) {
//               console.log('Error:', err); // database or unknown error
//               callback(false);
//             } else {
//               console.log('Found user to delete');
//               user.remove(function (err) {
//                 if (err) {
//                   console.log('Error:', err); // database or unknown error
//                   callback(false);
//                 } else {
//                   console.log('successfully removed user');
//                   callback(true);
//                 }
//               });
//             }
//           });
//         });

//       },

//       /**
//        * Takes in user's googleId, google Token, google Token secret and callback
//        * Saves new user to database
//        */
//       saveUser: function(googleId, googleToken, googleTokenSecret, callback) {
//         var user = nohm.factory('User');
//         user.p({
//           googleId: googleId,
//           googleToken: googleToken,
//           googleTokenSecret: googleTokenSecret
//           // googleTokenExp: profile.exp.toString()
//         });

//         user.save(function (err) {
//           if (err) console.log(err);
//           err ? callback(false) : callback(true)
//         });
//       }
//     }

//   });
// };
