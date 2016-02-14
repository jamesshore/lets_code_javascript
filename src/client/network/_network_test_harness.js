// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false */
(function() {
	"use strict";

	exports.PORT = 5030;

	// Socket.IO doesn't exit cleanly, so we have to manually collect the connections
	// and unref() them so the server process will exit.
	// See bug #1602: https://github.com/socketio/socket.io/issues/1602
	var connections = [];

	exports.startTestServer = function() {
		var http = require('http');
		var socketIo = require('socket.io');

		var server = http.createServer();
		var io = socketIo(server);

		server.on("connection", function(socket) {
			connections.push(socket);
		});

		server.listen(exports.PORT);
		return io;
	};

	exports.stopTestServerFn = function(io, callback) {
		return function() {
			io.close();
			connections.forEach(function(socket) {
				socket.unref();
			});
			callback();
		};
	};


}());