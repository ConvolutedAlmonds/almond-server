var express = require('express');
var app = express();
var apiRouter = express.Router();
var bodyParser = require('body-parser')

app.use(bodyParser.json());
app.use('/api', apiRouter);

var main = require('./routes/main.js')(app);
var api = require('./routes/api.js')(app, apiRouter);
var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log('Listening on port', port)
})