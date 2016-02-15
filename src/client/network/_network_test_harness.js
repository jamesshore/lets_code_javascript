// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false, $:false */
(function() {
	"use strict";

	var CONNECTED_CLIENTS = "/connected-clients";
	var WAIT_FOR_DISCONNECT = "/wait-for-disconnect";
	exports.PORT = 5030;

	var server = exports.server = {};

	// Socket.IO doesn't exit cleanly, so we have to manually collect the connections
	// and unref() them so the server process will exit.
	// See bug #1602: https://github.com/socketio/socket.io/issues/1602
	server.connections = [];

	server.start = function() {
		var http = require("http");
		var socketIo = require("socket.io");
		var url = require("url");
		var querystring = require("querystring");

		var httpServer = http.createServer();

		httpServer.on("connection", function(socket) {
			server.connections.push(socket);
		});

		httpServer.on("request", function(request, response) {
			response.setHeader("Access-Control-Allow-Origin", "*");

			var parsedUrl = url.parse(request.url);
			var path = parsedUrl.pathname;
			if (path === CONNECTED_CLIENTS) {
				var socketIds = Object.keys(io.sockets.connected).map(function(id) {
					return id.substring(2);
				});
				response.end(JSON.stringify(socketIds));
			}
			else if (path === WAIT_FOR_DISCONNECT) {
				var socketId = "/#" + querystring.parse(parsedUrl.query).socketId;

				console.log(Object.keys(io.sockets.connected), socketId);

				var socket = io.sockets.sockets[socketId];

				if (socket === undefined || socket.disconnected) return response.end("disconnected");
				console.log("Not disconnected");
				socket.on("disconnect", function() {
					console.log("Disconnect event");
					return response.end("disconnected");
				});
			}
			else {
				response.statusCode = 404;
				response.end("Not Found");
			}
		});

		var io = socketIo(httpServer);
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

	client.waitForServerDisconnect = function waitForServerDisconnect(socketId) {
		console.log("Waiting for disconnect", socketId);
		var origin = window.location.protocol + "//" + window.location.hostname + ":" + exports.PORT;
		var url = origin + WAIT_FOR_DISCONNECT;
		var request = $.ajax({
			type: "GET",
			url: url,
			data: { socketId: socketId },
			async: false,
			cache: false
		});
		if (request.status !== 200) throw new Error("Invalid status: " + request.status);

		console.log(request.responseText);
	};

	client.isConnected = function isConnected(socketId) {
		var origin = window.location.protocol + "//" + window.location.hostname + ":" + exports.PORT;
		var url = origin + CONNECTED_CLIENTS;
		var request = $.ajax({
			type: "GET",
			url: url,
			async: false,
			cache: false
		});
		if (request.status !== 200) throw new Error("Invalid status: " + request.status);

		var connectedIds = JSON.parse(request.responseText);
		return connectedIds.indexOf(socketId) !== -1;
	};

}());