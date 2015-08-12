var path = require('path');
var port = process.env.PORT || 3333;
var host; // filled in on first incoming request
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Fill in host on first incoming request
app.use('/', function(req, res, next){
  if(!host){
    host = req.headers.host.split(':')[0];
    console.log('I am https://'+host+':'+port+' running in '+process.env.environment || 'development'+' mode.');
  }
  next();
})

var requests = [];

////////////
// Routes //
////////////

app.get('/target', function(req, res){
  requests.push({
    'time-received': new Date(),
    'query': req.query,
    'params': req.params,
    'url': req.url,
    'method': req.method,
    'statusCode': req.statusCode,
    'headers': req.headers,
    'trailers': req.trailers,
    'httpVersion': req.httpVersion
  });
  console.log('Received GET as request #'+requests.length+'.');
  res.sendStatus(200); // TODO customizable
})

// curl -H "Content-Type: application/json" -X POST -d '{"username":"abc","password":"xyz"}' http://localhost:3333/target?x=y
app.post('/target', function(req, res){   requests.push({
    'time-received': new Date(),
    'body': req.body,
    'query': req.query,
    'params': req.params,
    'url': req.url,
    'method': req.method,
    'statusCode': req.statusCode,
    'headers': req.headers,
    'trailers': req.trailers,
    'httpVersion': req.httpVersion
  });
  console.log('Received POST as request #'+requests.length+'.');
  res.sendStatus(200); // TODO customizable
})

app.get('/data', function (req, res) {
  // respond with logged requests
  console.log('Sending',requests.length,'requests.');
  res.send(requests);
});

app.get('/', function(req, res){
  // return index.html
  res.sendFile(path.join(__dirname, 'index.html'));
})

// Start the server!
app.listen(port, function() {
  console.log("Server listening on port " + port);
});
