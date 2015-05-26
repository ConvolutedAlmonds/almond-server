module.exports = function(app, router) {

  router.get('/upcomingEvents', function(req, res) {
    console.log("Upcoming events");
    res.status(200);
  })
  router.get('/routes', function(req, res) {
    console.log("Routes");
    res.status(200);
    res.json({response: 'success'})
  })

}