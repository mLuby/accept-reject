var path = require('path');
var port = process.env.PORT || 3333;
var host; // filled in on first incoming request
var express = require('express');
var app = express();

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

app.get('/request', function(req, res){
  requests.push({
    'time-received': new Date(),
    'readable': req.readable,
    'domain': req.domain,
    'httpVersion': req.httpVersion,
    'complete': req.complete,
    'headers': req.headers,
    'trailers': req.trailers,
    'url': req.url,
    'method': req.method,
    'statusCode': req.statusCode,
    'httpVersionMajor': req.httpVersionMajor,
    'httpVersionMinor': req.httpVersionMinor,
    'upgrade': req.upgrade,
    'next': req.next,
    'baseUrl': req.baseUrl,
    'originalUrl': req.originalUrl,
    'params': req.params,
    'query': req.query,
    'route': req.route
  });
  console.log('Received request',requests.length+'.');
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
