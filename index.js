var express = require('express');
var app = express();
var bodyParser = require('body-parser')

app.use(bodyParser.json());
var main = require('./routes/main.js')(app);
var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log('Listening on port', port)
})