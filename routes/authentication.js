module.exports = function(app, router, jwt) {


  router.use(function(req, res, next) {

    // check header or url parameters or post parameters for token
      var token = req.body.token || req.query.token || req.headers['x-access-token'];

      // decode token
      if (token) {

        console.log('token found:', req.headers['x-access-token'])

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
        console.log('token not found');
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

      }
  });

};
