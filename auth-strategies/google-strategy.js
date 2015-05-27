module.exports = function(passport, app, jwt, nohm) {
  var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
  var credentials = require('./../config.js');

  passport.use(new GoogleStrategy({
      clientID: credentials.installed.client_id,
      clientSecret: credentials.installed.client_secret,
      callbackURL: "http://127.0.0.1:3000/auth/google/callback"
    },
      function(token, tokenSecret, profile, done) {

        process.nextTick(function () {
        // create a token
        var jwtToken = jwt.sign(profile, app.get('superSecret'), {
          expiresInMinutes: 1440 // expires in 24 hours
        });

        console.log('token:', token);
        console.log('tokenSecret:', tokenSecret);
        console.log('profile:', profile);
        // console.log('done:', token);
        
        var user = nohm.factory('User');
        user.p({
          googleId: profile.id,
          googleToken: token,
          googleTokenSecret: tokenSecret
        });

        user.save(function (err) {
          if (err) {
             console.log('Error saving user:', err); // database or unknown error
          } else {
            console.log('User saved');
          }
         });


        // console.log(profile);
        // To keep the example simple, the user's Google profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the Google account with a user record in your database,
        // and return that user instead.
        return done(null, { token: jwtToken });
      });
    }
  ));
  app.get('/auth/google', passport.authenticate('google', { session: false, scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/calendar.readonly']}));
  app.get('/auth/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/temp' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.json({token: req.user.token});
  });
}
