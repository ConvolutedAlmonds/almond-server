module.exports = function(passport, app, jwt, nohm, credentials, User) {
  var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
  var google = require('googleapis');
  var googleAuth = require('google-auth-library');
  var calendar = google.calendar('v3');

  passport.use(new GoogleStrategy({
      clientID: credentials.installed.client_id,
      clientSecret: credentials.installed.client_secret,
      callbackURL: "http://localhost:3000/auth/google/callback"
    },
      function(token, tokenSecret, profile, done) {

        process.nextTick(function () {
        // create a token
        var jwtToken = jwt.sign(profile.id, app.get('superSecret'), {
          expiresInMinutes: 1440 // expires in 24 hours
        });

        // var user = new User({
        //   googleId: 'testid',
        //   googleToken: 'testtoken',
        //   googleTokenSecret: 'testSecret',
        //   googleTokenExp: 'testExp'
        // })
        //   .save().then(function(user) {
        //     console.log('\n ----- USER SAVED ----- \n');
        //   })

        // UserModel.methods.saveUser(profile.id, token, tokenSecret, function(userWasSaved) {
        //   userWasSaved ? console.log('User saved') : console.log('Error saving user...');
        // })

        // To keep the example simple, the user's Google profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the Google account with a user record in your database,
        // and return that user instead.
        return done(null, { token: jwtToken });
      });
    }
  ));

  app.get('/auth/google', passport.authenticate('google', { session: false, approval_prompt: 'auto', scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/calendar.readonly']}));
  app.get('/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/temp' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.json({token: req.user.token});
  });

  // app.get('/auth/google-client', function(req, res) {
  //   console.log('client callback');
  //   res.json({response: 'Success'})
  // });

}
