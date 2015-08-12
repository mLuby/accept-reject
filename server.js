var path = require('path');
var port = process.env.PORT || 3333;
var host; // filled in on first incoming request
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var hat = require('hat');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Fill in host on first incoming request
app.use('/', function(req, res, next){
  if(!host){
    host = req.headers.host.split(':')[0];
    console.log('I am https://'+host+':'+port+' running in '+(process.env.environment || 'development')+' mode.');
  }
  next();
})

var stories = {
  default: {
    requests: [],
    statusCode: 200
  }
};
////////////
// Routes //
////////////

app.get('/:story/status-code', function(req, res){
  // get status code for a story
  res.json(stories[req.params.story].statusCode)
})

app.post('/:story/status-code', function(req, res){
  // set status code for a story
  cleanStatusCode = Number(req.body.statusCode)
  if(isNaN(cleanStatusCode) && cleanStatusCode !== 0){
    console.error('statusCode',req.body.statusCode,'not a number')
  } else {
    console.log('setting', stories[req.params.story].statusCode, 'to', cleanStatusCode);
    stories[req.params.story].statusCode = cleanStatusCode
  }
  res.sendStatus(200)
})

app.get('/:story/target', function(req, res){
  // capture :story GET request
  var story = stories[req.params.story];
  story.requests.push({
    'timeReceived': new Date(),
    'query': req.query,
    'params': req.params,
    'url': req.url,
    'method': req.method,
    'statusCode': req.statusCode,
    'headers': req.headers,
    'trailers': req.trailers,
    'httpVersion': req.httpVersion
  });
  console.log('Received GET as request #'+story.requests.length+'.');
  res.sendStatus(story.statusCode);
})

// curl -H "Content-Type: application/json" -X POST -d '{"username":"abc","password":"xyz"}' http://localhost:3333/target?x=y
app.post('/:story/target', function(req, res){
  // capture :story POST request
  var story = stories[req.params.story];
  story.requests.push({
    'timeReceived': new Date(),
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
  console.log('Received POST as request #'+story.requests.length+'.');
  res.sendStatus(story.statusCode);
})

app.get('/:story/data', function (req, res) {
  // respond with logged requests
  var story = stories[req.params.story];
  res.send(story.requests);
});

app.post('/:story/destroy', function(req, res){
  // respond with logged requests
  var story = stories[req.params.story];
  story.requests = []
  res.sendStatus(200);
})

app.get('/:story', function(req, res){
  // return index.html with cookie containing story
  res.cookie('story='+req.params.story+';')
  res.sendFile(path.join(__dirname, 'index.html'));
  stories[req.params.story] = stories[req.params.story] || {requests:[], statusCode:200};
})

app.get('/', function(req, res){
  // redirect to new /:story
  var story = hat();
  res.redirect('/'+story);
})

// Start the server!
app.listen(port, function() {
  console.log("Server listening on port " + port);
});
