// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var RealTimeServer = require("./real_time_server.js");
	var HttpServer = require("./http_server.js");
	var http = require("http");
	var fs = require("fs");
	var async = require("async");
	var assert = require("_assert");
	var io = require("socket.io-client");

	var IRRELEVANT_DIR = "generated/test";
	var IRRELEVANT_PAGE = "irrelevant.html";

	var PORT = 5020;

	describe("RealTimeServer", function() {
		var httpServer;
		var realTimeServer;

		beforeEach(function(done) {
			httpServer = new HttpServer(IRRELEVANT_DIR, IRRELEVANT_PAGE);
			realTimeServer = new RealTimeServer();

			realTimeServer.start(httpServer.getNodeServer());
			httpServer.start(PORT, done);
		});

		afterEach(function(done) {
			waitForConnectionCount(0, "afterEach() requires all sockets to be closed", function() {
				httpServer.stop(done);
			});
		});

		it("counts the number of connections", function(done) {
			assert.equal(realTimeServer.numberOfActiveConnections(), 0, "before opening connection");

			createSocket(function(socket) {
				waitForConnectionCount(1, "after opening connection", function() {
					assert.equal(realTimeServer.numberOfActiveConnections(), 1, "after opening connection");
					closeSocket(socket, function() {
						waitForConnectionCount(0, "after closing connection", done);
					});
				});
			});
		});

		function waitForConnectionCount(expectedConnections, message, callback) {
			var TIMEOUT = 1000; // milliseconds
			var RETRY_PERIOD = 10; // milliseconds

			var retryOptions = { times: TIMEOUT / RETRY_PERIOD, interval: RETRY_PERIOD };
			async.retry(retryOptions, function(next) {
				if (realTimeServer.numberOfActiveConnections() === expectedConnections) return next();
				else return next("fail");
			}, function(err) {
				if (err) return assert.equal(realTimeServer.numberOfActiveConnections(), expectedConnections, message);
				else setTimeout(callback, 0);
			});
		}

		function createSocket(callback) {
			console.log("createSocket()");
			var socket = io("http://localhost:" + PORT);
			return callback(socket);
			socket.on("connect", function() {
				console.log("CLIENT SOCKET.IO CONNECT", socket.id);
			});
		}

		function closeSocket(socket, callback) {
			console.log("closeSocket()");
			var id = socket.id;
			socket.on("disconnect", function() {
				console.log("CLIENT SOCKET.IO DISCONNECT", id);
			});
			socket.disconnect();
			callback();
		}

	});

}());