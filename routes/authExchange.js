// Parses a google jwt and returns sub property (google ID of user)
var parseGoogleJwt = function(googleJwt) {
  var parts = googleJwt.split('.');
  var headerBuf = new Buffer(parts[0], 'base64');
  var bodyBuf = new Buffer(parts[1], 'base64');
  var header = JSON.parse(headerBuf.toString());
  var body = JSON.parse(bodyBuf.toString());

  return body.sub;
}

module.exports = function(app, router, credentials, request, User, jwt) {

  router.get('/code', function(req, res) {
    console.log('code', req.query.code);

    var code = req.query.code || '4/bIpLbbfrtcXw4cwdXMXrIWQJizhPjUggK_jbNmiM0uc.0u9pik9gXK4QEnp6UAPFm0E02rd3mwI';

    var url = 'https://accounts.google.com/o/oauth2/token';
    var payload = {
      grant_type: 'authorization_code',
      code: code,
      client_id: credentials.installed.client_id,
      client_secret: credentials.installed.client_secret,
      redirect_uri: 'http://localhost/callback'
    };

    request.post(url, { form: payload }, function(error, response, body) {
      if (error) console.log('error using auth code:', error)
      // console.log('body:', body);

      body = JSON.parse(body);

      var userId = parseGoogleJwt(body.id_token);

      var jwtToken = jwt.sign(userId, app.get('superSecret'), {
        expiresInMinutes: 1440 // expires in 24 hours
      });

      console.log('responding with jwt');
      console.log(jwtToken);

      new User({
        googleId: userId
      }).fetch().then(function(user) {
        if (!user) {
          console.log('new user');

          var tokenExpirationDate = moment().add(body.expires_in, 'seconds').format();
          console.log('first token exp date', tokenExpirationDate)

          new User({
            googleId: userId,
            accessToken: body.access_token,
            refreshToken: body.refresh_token,
            secondsValid: body.expires_in,
            tokenExpDate: tokenExpirationDate
          })
            .save()
            .then(function(user) {
              console.log('New user saved!', user)
            }).catch(function(err) {
              console.error('Error saving new user:', err);
            });

        } else {
          console.log('user already exists')
        }
      })

      res.status(200);
      res.json({jwt: jwtToken});

    });
  });

};

