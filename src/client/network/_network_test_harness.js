// Copyright (c) 2015-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false, $:false */
(function() {
	"use strict";


	var IS_CONNECTED = "/is-connected";
	var WAIT_FOR_SERVER_DISCONNECT = "/wait-for-server-disconnect";
	var WAIT_FOR_POINTER_LOCATION = "/wait-for-pointer-location";
	var SEND_POINTER_LOCATION = "/send-pointer-location";

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

		var httpServer = http.createServer();
		httpServer.on("request", handleResponse);
		var io = socketIo(httpServer);
		httpServer.listen(exports.PORT);

		var endpointMap = {};
		endpointMap[IS_CONNECTED] = setupIsConnected();
		endpointMap[WAIT_FOR_SERVER_DISCONNECT] = setupWaitForServerDisconnect();
		endpointMap[WAIT_FOR_POINTER_LOCATION] = setupWaitForPointerLocation();
		endpointMap[SEND_POINTER_LOCATION] = setupSendPointerLocation();

		return stopFn();

		function handleResponse(request, response) {
			response.setHeader("Access-Control-Allow-Origin", "*");

			var parsedUrl = url.parse(request.url);
			var path = parsedUrl.pathname;

			var endpoint = endpointMap[path];
			if (endpoint !== undefined) {
				var parsedQuery = querystring.parse(parsedUrl.query);
				var parsedData = parsedQuery.data !== undefined ? JSON.parse(parsedQuery.data) : undefined;
				endpoint(getSocket(parsedQuery.socketId), parsedData, request, response);
			}
			else {
				response.statusCode = 404;
				response.end("Not Found");
			}
		}

		function getSocket(clientSocketId) {
			var socketId = "/#" + clientSocketId;
			return io.sockets.sockets[socketId];
		}

		function stopFn() {
			// Socket.IO doesn't exit cleanly, so we have to manually collect the connections
			// and unref() them so the server process will exit.
			// See bug #1602: https://github.com/socketio/socket.io/issues/1602
			var connections = [];
			httpServer.on("connection", function(socket) {
				connections.push(socket);
			});

			return function(callback) {
				return function() {
					io.close();
					connections.forEach(function(socket) {
						socket.unref();
					});
					callback();
				};
			};
		}

		function setupWaitForPointerLocation() {
			var lastPointerLocation = {};

			io.on("connection", function(socket) {
				socket.on("mouse", function(data) {
					lastPointerLocation[socket.id] = data;
				});
			});

			return function waitForPointerLocationEndpoint(socket, data, request, response) {
				var socketId = socket.id;

				var result = lastPointerLocation[socketId];

				if (result === undefined) {
					socket.on("mouse", sendResponse);
				}
				else {
					sendResponse(result);
				}

				function sendResponse(data) {
					response.end(JSON.stringify(data));
					delete lastPointerLocation[socketId];
				}
			};
		}

		function setupIsConnected() {
			return function isConnectedEndpoint(socket, data, request, response) {
				var socketIds = Object.keys(io.sockets.connected).map(function(id) {
					return id.substring(2);
				});
				response.end(JSON.stringify(socketIds));
			};
		}

		function setupWaitForServerDisconnect() {
			return function waitForServerDisconnectEndpoint(socket, data, request, response) {
				if (socket === undefined || socket.disconnected) return response.end("disconnected");
				socket.on("disconnect", function() {
					return response.end("disconnected");
				});
			};
		}

		function setupSendPointerLocation() {
			return function sendPointerLocationEndpoint(socket, data, request, response) {
				socket.emit("mouse", { id: data.id, x: data.x, y: data.y });

				return response.end("ok");
			};
		}

	};




	var client = exports.client = {};

	client.waitForServerDisconnect = function waitForServerDisconnect(connection, callback) {
		ajax({
			connection: connection,
			endpoint: WAIT_FOR_SERVER_DISCONNECT,
			async: true
		}, function(err, responseText) {
			return callback(err);
		});
	};

	client.isConnected = function isConnected(connection) {
		var responseText = ajax({
			connection: connection,
			endpoint: IS_CONNECTED,
			async: false
		});

		var connectedIds = JSON.parse(responseText);
		return connectedIds.indexOf(connection.getSocketId()) !== -1;
	};

	client.waitForPointerLocation = function waitForPointerLocation(connection, callback) {
		ajax({
			connection: connection,
			endpoint: WAIT_FOR_POINTER_LOCATION,
			async: true
		}, function(err, responseText) {
			return callback(err, JSON.parse(responseText));
		});
	};

	client.sendPointerLocation = function sendPointerLocation(connection, event, callback) {
		ajax({
			connection: connection,
			endpoint: SEND_POINTER_LOCATION,
			async: true,
			data: event
		}, function(err, responseText) {
			callback();
		});
	};

	function ajax(options, callback) {
		var origin = window.location.protocol + "//" + window.location.hostname + ":" + exports.PORT;
		var request = $.ajax({
			type: "GET",
			url: origin + options.endpoint,
			data: {
				data: JSON.stringify(options.data),
				socketId: options.connection.getSocketId()
			},
			async: options.async,
			cache: false
		});

		if (options.async) {
			request.done(function() {
				if (request.status !== 200) throw new Error("Invalid status: " + request.status);
				return callback(null, request.responseText);
			});
			request.fail(function(_, errorText) {
				throw new Error(errorText);
			});
		}
		else {
			if (request.status !== 200) throw new Error("Invalid status: " + request.status);
			else return request.responseText;
		}
	}

}());