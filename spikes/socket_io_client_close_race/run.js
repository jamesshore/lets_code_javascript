(function() {
	"use strict";

	var clientIo = require("socket.io-client");
	var http = require("http");
	var io = require('socket.io');

	var httpServer;
	var ioServer;

	var PORT = 5020;

	startServer(function() {
		console.log("SERVER STARTED");

		var client = clientIo("http://localhost:" + PORT);

		client.on('connect', function() {
			client.disconnect();
			stopServer(function() {
				console.log("COMPLETE! NODE SHOULD EXIT NOW.");
			});
		});
	});

	function startServer(callback) {
		httpServer = http.createServer();
		ioServer = io(httpServer);
		httpServer.listen(PORT, callback);
	};

	function stopServer(callback) {
		httpServer.on("close", function() {
			console.log("SERVER CLOSED");
			callback();
		});

		ioServer.close();
	};

}());