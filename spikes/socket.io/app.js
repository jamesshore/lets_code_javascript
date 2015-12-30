var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(8080);

console.log("Server started");
function handler (req, res) {
	console.log("Request received");

  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
	  console.log("index.html served");
  });
}

io.on('connection', function (socket) {
	console.log("Connection created");

  socket.emit('news', { hello: 'world' });
	console.log("'news' event emitted");

  socket.on('my other event', function (data) {
	  console.log("event received");

    console.log(data);
  });

	socket.on("message", function(message) {
		console.log("Message posted: " + message);
		socket.emit("serverMessage", message);
	});

});