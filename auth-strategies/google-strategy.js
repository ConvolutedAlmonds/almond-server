module.exports = function(passport) {
  var GoogleStrategy = require('passport-google-oauth').OAuthStrategy;
  var credentials = require('./../config.js');

  passport.use(new GoogleStrategy({
      consumerKey: credentials.installed.client_id,
      consumerSecret: credentials.installed.client_secret,
      callbackURL: "http://127.0.0.1:3000/api/google/return"
    },
    function(token, tokenSecret, profile, done) {
      console.log(profile);
      done(true, { username: 'Kyle', password: 'Shockey'});

    }
  ));

}
