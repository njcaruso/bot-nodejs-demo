var restify = require('restify');

var server = restify.createServer({
  name: 'bot-nodejs-demo',
  version: '1.0.0',
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/echo/:name', function (req, res, next) {
  console.log('received request');
  res.send(req.params);
  return next();
});

var port = process.env.PORT || 8080; // azure will specify port

server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});
