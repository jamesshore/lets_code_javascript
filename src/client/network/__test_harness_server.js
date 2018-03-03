// Copyright (c) 2015-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false, $:false */
(function() {
	"use strict";

	var shared = require("./__test_harness_shared.js");
	var failFast = require("fail_fast");
	var http = require("http");
	var socketIo = require("socket.io");
	var url = require("url");
	var querystring = require("querystring");
	var ClientPointerMessage = require("../../shared/client_pointer_message.js");
	var ClientDrawMessage = require("../../shared/client_draw_message.js");

	var endpoints = shared.endpoints;

	// The network test harness is started inside of the build script before the network tests are run
	exports.start = function() {
		var httpServer = http.createServer();
		httpServer.on("request", handleRequest);
		var io = socketIo(httpServer);
		httpServer.listen(shared.PORT);

		var endpointMap = {};
		endpointMap[endpoints.IS_CONNECTED] = setupIsConnected(io);
		endpointMap[endpoints.WAIT_FOR_SERVER_DISCONNECT] = setupWaitForServerDisconnect();
		endpointMap[endpoints.SEND_MESSAGE] = setupSendMessage();
		endpointMap[endpoints.WAIT_FOR_MESSAGE] = setupWaitForMessage(io);

		return stopFn(httpServer, io);

		function handleRequest(request, response) {
			response.setHeader("Access-Control-Allow-Origin", "*");

			var parsedUrl = url.parse(request.url);
			var path = parsedUrl.pathname;

			var endpoint = endpointMap[path];
			if (endpoint !== undefined) {
				var parsedQuery = querystring.parse(parsedUrl.query);
				var parsedData = parsedQuery.data !== undefined ? JSON.parse(parsedQuery.data) : undefined;
				endpoint(getSocket(io, parsedQuery.socketId), parsedData, request, response);
			}
			else {
				response.statusCode = 404;
				response.end("Not Found");
			}
		}
	};

	function getSocket(io, clientSocketId) {
		return io.sockets.sockets[clientSocketId];
	}

	function stopFn(httpServer, io) {
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

	function setupIsConnected(io) {
		return function isConnectedEndpoint(socket, data, request, response) {
			var socketIds = Object.keys(io.sockets.connected);
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

	function setupSendMessage() {
		return function sendMessageEndpoint(socket, data, request, response) {
			socket.emit(data.messageName, data.messageData);
			return response.end("ok");
		};
	}

	function setupWaitForMessage(io) {
		var lastDrawMessage = {};

		var TESTABLE_MESSAGES = [
			ClientDrawMessage.MESSAGE_NAME,
			ClientPointerMessage.MESSAGE_NAME
		];

		io.on("connection", function(socket) {
			TESTABLE_MESSAGES.forEach(function(messageName) {
				socket.on(messageName, function(data) {
					lastDrawMessage[messageDataKey(socket.id, messageName)] = data;
				});
			});
		});

		return function waitForMessageEndpoint(socket, data, request, response) {
			var messageName = data.messageName;
			failFast.unlessTrue(
				TESTABLE_MESSAGES.indexOf(messageName) !== -1,
				messageName + " not yet supported; add it to TESTABLE_EVENTS constant in test harness server."
			);
			var key = messageDataKey(socket.id, messageName);

			var result = lastDrawMessage[key];
			if (result === undefined) {
				socket.once(messageName, sendResponse);
			}
			else {
				sendResponse(result);
			}

			function sendResponse(data) {
				response.end(JSON.stringify(data));
				delete lastDrawMessage[key];
			}
		};

		function messageDataKey(socketId, messageName) {
			return socketId + "|" + messageName;
		}
	}

}());