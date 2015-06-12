module.exports = function(appl) {

  /**
   * Cors headers
   */
  appl.use(function(req, res, next) {

    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-Access-Token, X-HTTP-Method-Override, Content-Type, Accept, Authorization');
    next();

  });

};
