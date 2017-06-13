(function() {
	"use strict";

	var clientIo = require("socket.io-client");
	var http = require("http");
	var io = require('socket.io');
	var async = require("async");


	var httpServer;
	var ioServer;

	var PORT = 5020;

	startServer(function() {
		console.log("SERVER STARTED");

		var connections = {};
		trackServerSocketIoConnections(connections);

		var client = clientIo("http://localhost:" + PORT);
		client.on('connect', function() {
			console.log("CLIENT CONNECTED");
		});
		waitForServerConnectionCount(connections, 1, "didn't connect", function() {
			client.disconnect();
			waitForServerConnectionCount(connections, 0, "didn't close connection", function() {
				stopServer(function() {
					console.log("COMPLETE! NODE SHOULD EXIT NOW.");
				});
			});
		});
	});

	function trackServerSocketIoConnections(connections) {
		ioServer.on("connection", function(socket) {
			var key = socket.id;
			console.log("SERVER SOCKET.IO CONNECT", key);
			connections[key] = socket;
			socket.on("disconnect", function() {
				console.log("SERVER SOCKET.IO DISCONNECT", key);
				delete connections[key];
			});
		});
	}

	function waitForServerConnectionCount(connections, expectedConnections, message, callback) {
		var TIMEOUT = 1000; // milliseconds
		var RETRY_PERIOD = 0.1; // milliseconds

		var retryOptions = { times: TIMEOUT / RETRY_PERIOD, interval: RETRY_PERIOD };
		async.retry(retryOptions, function(next) {
			if (numberOfServerConnections(connections) === expectedConnections) return next();
			else return next("fail");
		}, function(err) {
			var numConnections = numberOfServerConnections(connections);
			if (err && (numConnections !== expectedConnections)) {
				throw new Error(message + ": expected " + expectedConnections + " connections, but was " + numConnections);
			}
			else {
				setTimeout(callback, 0);
			}
		});
	}

	function numberOfServerConnections(connections) {
		return Object.keys(connections).length;
	}

	function startServer(callback) {
		console.log("starting server");
		httpServer = http.createServer();
		ioServer = io(httpServer);
		httpServer.listen(PORT, callback);
	};

	function stopServer(callback) {
		console.log("stopping server");

		httpServer.on("close", function() {
			console.log("SERVER CLOSED");
			callback();
		});

		ioServer.close();
	};

}());