var fakeUser = {
  username: 'Kyle',
  password: 'Shockey'
};

module.exports = function(app, router, jwt) {

  router.post('/authenticate', function(req, res) {
    console.log(req.body);

    if (req.body.username === 'Kyle' && req.body.password === 'Shockey') {
      // if user is found and password is right
        // create a token
        var token = jwt.sign(fakeUser, app.get('superSecret'), {
          expiresInMinutes: 1440 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
    } else  {
      res.json({
        success: false
      })
    }
  })

  router.use(function(req, res, next) {
    // check header or url parameters or post parameters for token
      var token = req.body.token || req.query.token || req.headers['x-access-token'];

      // decode token
      if (token) {

        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {
          if (err) {
            return res.json({ success: false, message: 'Failed to authenticate token.' });
          } else {
            // if everything is good, save to request for use in other routes
            req.decoded = decoded;
            next();
          }
        });

      } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

      }
  });


};