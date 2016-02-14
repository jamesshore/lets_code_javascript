// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false, $:false */
(function() {
	"use strict";

	var CONNECTED_CLIENTS = "/connected-clients";
	exports.PORT = 5030;

	var server = exports.server = {};

	// Socket.IO doesn't exit cleanly, so we have to manually collect the connections
	// and unref() them so the server process will exit.
	// See bug #1602: https://github.com/socketio/socket.io/issues/1602
	server.connections = [];

	server.start = function() {
		var socketIoConnections = [];

		var http = require('http');
		var socketIo = require('socket.io');

		var httpServer = http.createServer();

		httpServer.on("connection", function(socket) {
			server.connections.push(socket);
		});



		httpServer.on("request", function(request, response) {
			response.setHeader("Access-Control-Allow-Origin", "*");

			if (request.url === CONNECTED_CLIENTS) {
				response.end(JSON.stringify(socketIoConnections));
			}
			else {
				response.statusCode = 404;
				response.end("Not Found");
			}

		});




		var io = socketIo(httpServer);
		io.on("connection", function(socket) {
			var userAgent = socket.request.headers["user-agent"];
			socketIoConnections.push(userAgent);
		});


		httpServer.listen(exports.PORT);
		return io;
	};

	server.stopFn = function(io, callback) {
		return function() {
			io.close();
			server.connections.forEach(function(socket) {
				socket.unref();
			});
			callback();
		};
	};


	var client = exports.client = {};

	client.isConnected = function isConnected() {
		var origin = window.location.protocol + "//" + window.location.hostname + ":" + exports.PORT;
		var url = origin + CONNECTED_CLIENTS;
		var request = $.ajax({
			type: "GET",
			url: url,
			async: false
		});
		if (request.status !== 200) throw new Error("Invalid status: " + request.status);

		var userAgents = JSON.parse(request.responseText);
		return userAgents.indexOf(navigator.userAgent) !== -1;
	};

}());