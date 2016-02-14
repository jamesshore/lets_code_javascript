// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false, $:false */
(function() {
	"use strict";

	exports.PORT = 5030;

	var server = exports.server = {};

	// Socket.IO doesn't exit cleanly, so we have to manually collect the connections
	// and unref() them so the server process will exit.
	// See bug #1602: https://github.com/socketio/socket.io/issues/1602
	server.connections = [];

	server.start = function() {
		var http = require('http');
		var socketIo = require('socket.io');

		var httpServer = http.createServer();
		var io = socketIo(httpServer);

		httpServer.on("connection", function(socket) {
			server.connections.push(socket);
		});




		httpServer.on("request", function(request, response) {
			response.setHeader("Access-Control-Allow-Origin", "*");
			response.end("hi, this is the test harness server!");
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
		var url = origin + "/connected-clients";
		var request = $.ajax({
			type: "GET",
			url: url,
			async: false
		});
		console.log(request.responseText);
		return true;
	};

}());