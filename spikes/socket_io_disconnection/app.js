var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

var port = process.argv[2] || 8080;

app.listen(port);

console.log("Server started on port " + port);
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
	console.log("\nConnection created");

	socket.on("message", function(message) {
		console.log("Message posted: " + message);
		io.emit("serverMessage", message);
	});

	socket.on("disconnect", function(reason) {
		console.log("Disconnect: ", reason);
	});

});