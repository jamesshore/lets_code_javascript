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

	var CONTENT_DIR = "generated/test";

	var INDEX_PAGE = "index.html";
	var OTHER_PAGE = "other.html";
	var NOT_FOUND_PAGE = "test404.html";

	var INDEX_PAGE_DATA = "This is index page file";
	var OTHER_PAGE_DATA = "This is another page";
	var NOT_FOUND_DATA = "This is 404 page file";



	var IRRELEVANT_DIR = "generated/test";
	var IRRELEVANT_PAGE = "irrelevant.html";

	var PORT = 5020;
	var BASE_URL = "http://localhost:" + PORT;

	var TEST_FILES = [
		[ CONTENT_DIR + "/" + INDEX_PAGE, INDEX_PAGE_DATA],
		[ CONTENT_DIR + "/" + OTHER_PAGE, OTHER_PAGE_DATA],
		[ CONTENT_DIR + "/" + NOT_FOUND_PAGE, NOT_FOUND_DATA]
	];

	describe("RealTimeServer", function() {
		var httpServer;
		var realTimeServer;


		// beforeEach(function(done) {
		// 	async.each(TEST_FILES, createTestFile, done);
		// });
		//
		// afterEach(function(done) {
		// 	async.each(TEST_FILES, deleteTestFile, done);
		// });



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

		// it("delay", function(done) {
		// 	this.timeout(10000);
		// 	setTimeout(done, 0);
		// });

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
			socket.on("connect", function() {
				console.log("CLIENT SOCKET.IO CONNECT", socket.id);
				return callback(socket);
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

		function createTestFile(fileAndData, done) {
			// Note: writeFile() MUST be called asynchronously in order for this code to work on Windows 7.
			// If it's called synchronously, it fails with an EPERM error when the second test starts. This
			// may be related to this Node.js issue: https://github.com/joyent/node/issues/6599
			// This issue appeared after upgrading send 0.2.0 to 0.9.3. Prior to that, writeFileSync()
			// worked fine.
			fs.writeFile(fileAndData[0], fileAndData[1], function(err) {
				if (err) console.log("could not create test file: [" + fileAndData[0] + "]. Error: " + err);
				done();
			});
		}

		function deleteTestFile(fileAndData, done) {
			// Note: unlink() MUST be called asynchronously here in order for this code to work on Windows 7.
			// If it's called synchronously, then it will run before the file is closed, and that is not allowed
			// on Windows 7. It's possible that this is the result of a Node.js bug; see this issue for details:
			// https://github.com/joyent/node/issues/6599
			var file = fileAndData[0];
			fs.unlink(file, function(err) {
				if (err) console.log("could not delete test file: [" + file + "]. Error: " + err);
				done();
			});
		}

	});

}());