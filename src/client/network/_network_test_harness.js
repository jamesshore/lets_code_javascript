// Copyright (c) 2015-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false, $:false */
(function() {
	"use strict";


	var CONNECTED_CLIENTS = "/connected-clients";
	var WAIT_FOR_DISCONNECT = "/wait-for-disconnect";
	var POINTER_LOCATION = "/pointer-location";

	exports.PORT = 5030;

	var server =  exports.server = {};

	// The network test harness is started inside of the build script before the network tests are run
	server.start = function() {
		// This code is Node-specific, but this file runs in both Node and clients, so anything Node-specific
		// has to be inside this function. As a result, this function is more like a standalone module.

		var http = require("http");
		var socketIo = require("socket.io");
		var url = require("url");
		var querystring = require("querystring");

		// Socket.IO doesn't exit cleanly, so we have to manually collect the connections
		// and unref() them so the server process will exit.
		// See bug #1602: https://github.com/socketio/socket.io/issues/1602
		var connections = [];


		var lastPointerLocation = {};

		var httpServer = http.createServer();

		httpServer.on("connection", function(socket) {
			connections.push(socket);
		});

		httpServer.on("request", function(request, response) {
			response.setHeader("Access-Control-Allow-Origin", "*");

			var parsedUrl = url.parse(request.url);
			var path = parsedUrl.pathname;
			switch(path) {
				case CONNECTED_CLIENTS: return connectedClientsEndpoint(parsedUrl, request, response);
				case WAIT_FOR_DISCONNECT: return waitForDisconnectEndpoint(parsedUrl, request, response);
				case POINTER_LOCATION: return pointerLocationEndpoint(parsedUrl, request, response);
				default:
					response.statusCode = 404;
					response.end("Not Found");
			}
		});

		var io = socketIo(httpServer);

		io.on("connection", function(socket) {
			socket.on("mouse", function(data) {
				lastPointerLocation[socket.id] = data;
			});
		});


		httpServer.listen(exports.PORT);

		return stopFn;

		function stopFn(callback) {
			return function() {
				io.close();
				connections.forEach(function(socket) {
					socket.unref();
				});
				callback();
			};
		}

		function connectedClientsEndpoint(parsedUrl, request, response) {
			var socketIds = Object.keys(io.sockets.connected).map(function(id) {
				return id.substring(2);
			});
			response.end(JSON.stringify(socketIds));
		}

		function waitForDisconnectEndpoint(parsedUrl, request, response) {
			var socketId = "/#" + querystring.parse(parsedUrl.query).socketId;

			var socket = io.sockets.sockets[socketId];

			if (socket === undefined || socket.disconnected) return response.end("disconnected");
			socket.on("disconnect", function() {
				return response.end("disconnected");
			});
		}

		function pointerLocationEndpoint(parsedUrl, request, response) {
			var socketId = "/#" + querystring.parse(parsedUrl.query).socketId;

			var result = lastPointerLocation[socketId];

			if (result === undefined) {
				var socket = io.sockets.sockets[socketId];
				socket.on("mouse", sendResponse);
			}
			else {
				sendResponse(result);
			}

			function sendResponse(data) {
				response.end(JSON.stringify(data));
				delete lastPointerLocation[socketId];
			}
		}
	};


	var client = exports.client = {};

	client.waitForServerDisconnect = function waitForServerDisconnect(connection, callback) {
		var origin = window.location.protocol + "//" + window.location.hostname + ":" + exports.PORT;
		var url = origin + WAIT_FOR_DISCONNECT;
		var request = $.ajax({
			type: "GET",
			url: url,
			data: { socketId: connection.getSocketId() },
			async: true,
			cache: false
		});
		request.done(function() {
			if (request.status !== 200) throw new Error("Invalid status: " + request.status);
			return callback();
		});
		request.fail(function(_, errorText) {
			throw new Error(errorText);
		});
	};

	client.isConnected = function isConnected(connection) {
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
		return connectedIds.indexOf(connection.getSocketId()) !== -1;
	};

	client.waitForPointerLocation = function waitForPointerLocation(connection, callback) {
		var origin = window.location.protocol + "//" + window.location.hostname + ":" + exports.PORT;
		var url = origin + POINTER_LOCATION;
		var request = $.ajax({
			type: "GET",
			url: url,
			data: { socketId: connection.getSocketId() },
			async: true,
			cache: false
		});
		request.done(function() {
			if (request.status !== 200) throw new Error("Invalid status: " + request.status);
			return callback(JSON.parse(request.responseText));
		});
		request.fail(function(_, errorText) {
			throw new Error(errorText);
		});
	};

	client.sendPointerLocation = function sendPointerLocation(x, y) {

	};

}());