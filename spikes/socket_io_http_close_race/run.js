(function() {
	"use strict";

	var clientIo = require("socket.io-client");
	var http = require("http");
	var io = require("socket.io");

	var httpServer;
	var ioServer;

	var PORT = 5020;

	startServer(function() {
		console.log("SERVER STARTED");

		var connections = {};
		logAndTrackServerConnections(connections);
		logHttpConnections();

		var serverSocket;
		ioServer.once("connect", function(socket) {
			console.log("** stored server socket", socket.id);
			serverSocket = socket;
		});

		console.log("** connecting client");
		var client = clientIo("http://localhost:" + PORT);
		logClientConnections(client);

		client.once("connect", function() {
			console.log("** disconnecting client");
			client.once("disconnect", function() {
				console.log("** waiting for server to disconnect");
				serverSocket.once("disconnect", function() {
					console.log("#### Does the client think it's connected? (Expect 'false'):", client.connected);
					console.log("#### How many connections does the server have? (Expect 0):", numberOfServerConnections(connections));
					stopServer(function() {
						console.log("** end of test")
					});
				});
			});
			client.disconnect();
		});
	});

	function logAndTrackServerConnections(connections) {
		ioServer.on("connect", function(socket) {
			var key = socket.id;
			console.log("SERVER CONNECTED", key);
			connections[key] = socket;
			socket.on("disconnect", function() {
				console.log("SERVER DISCONNECTED", key);
				delete connections[key];
			});
		});
	}

	function logHttpConnections() {
		httpServer.on('connection', function(socket) {
			var id = socket.remoteAddress + ':' + socket.remotePort;
			console.log("HTTP CONNECT", id);
			socket.on("close", function() {
				console.log("HTTP DISCONNECT", id);
			});
		});
	}

	function logClientConnections(socket) {
		var id;
		socket.on("connect", function() {
			id = socket.id;
			console.log("CLIENT CONNECTED", id);
		});
		socket.on("disconnect", function() {
			console.log("CLIENT DISCONNECTED", id);
		});
	}

	function numberOfServerConnections(connections) {
		return Object.keys(connections).length;
	}

	function startServer(callback) {
		console.log("** starting server");
		httpServer = http.createServer();
		ioServer = io(httpServer);
		httpServer.listen(PORT, callback);
	};

	function stopServer(callback) {
		console.log("** stopping server");

		httpServer.close(function() {
			console.log("SERVER CLOSED");
			callback();
		});

		// httpServer.on("close", function() {
		// 	console.log("SERVER CLOSED");
		// 	callback();
		// });
		//
		// ioServer.close();
	};

}());