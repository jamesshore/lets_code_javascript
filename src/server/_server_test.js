// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var server = require("./server.js");
	var http = require("http");
	var fs = require("fs");
	var async = require("async");
	var assert = require("../shared/_assert.js");
	var io = require("socket.io-client");

	var CONTENT_DIR = "generated/test";

	var INDEX_PAGE = "index.html";
	var OTHER_PAGE = "other.html";
	var NOT_FOUND_PAGE = "test404.html";

	var INDEX_PAGE_DATA = "This is index page file";
	var OTHER_PAGE_DATA = "This is another page";
	var NOT_FOUND_DATA = "This is 404 page file";

	var PORT = 5020;
	var BASE_URL = "http://localhost:" + PORT;

	var TEST_FILES = [
		[ CONTENT_DIR + "/" + INDEX_PAGE, INDEX_PAGE_DATA],
		[ CONTENT_DIR + "/" + OTHER_PAGE, OTHER_PAGE_DATA],
		[ CONTENT_DIR + "/" + NOT_FOUND_PAGE, NOT_FOUND_DATA]
	];

	describe("HTTP Server", function() {

		beforeEach(function(done) {
			async.each(TEST_FILES, createTestFile, done);
		});

		afterEach(function(done) {
			async.each(TEST_FILES, deleteTestFile, done);
		});

		it("serves files from directory", function(done) {
			httpGet(BASE_URL + "/" + INDEX_PAGE, function(response, responseData) {
				assert.equal(response.statusCode, 200, "status code");
				assert.equal(responseData, INDEX_PAGE_DATA, "response text");
				done();
			});
		});

		it("sets content-type and charset for HTML files", function(done) {
			httpGet(BASE_URL + "/" + INDEX_PAGE, function(response, responseData) {
				assert.equal(response.headers["content-type"], "text/html; charset=UTF-8", "content-type header");
				done();
			});
		});

		it("supports multiple files", function(done) {
			httpGet(BASE_URL + "/" + OTHER_PAGE, function(response, responseData) {
				assert.equal(response.statusCode, 200, "status code");
				assert.equal(responseData, OTHER_PAGE_DATA, "response text");
				done();
			});
		});

		it("serves index.html when asked for home page", function(done) {
			httpGet(BASE_URL, function(response, responseData) {
				assert.equal(response.statusCode, 200, "status code");
				assert.equal(responseData, INDEX_PAGE_DATA, "response text");
				done();
			});
		});

		it("returns 404 when file doesn't exist", function(done) {
			httpGet(BASE_URL + "/bargle", function(response, responseData) {
				assert.equal(response.statusCode, 404, "status code");
				assert.equal(responseData, NOT_FOUND_DATA, "404 text");
				done();
			});
		});

		it("sets content-type and charset for 404 page", function(done) {
			httpGet(BASE_URL + "/bargle", function(response, responseData) {
				assert.equal(response.headers["content-type"], "text/html; charset=UTF-8", "content-type header");
				done();
			});
		});

		it("requires home page parameter", function() {
			assert.throws(function() {
				server.start();
			});
		});

		it("requires 404 page parameter", function() {
			assert.throws(function() {
				server.start(CONTENT_DIR);
			});
		});

		it("requires port parameter", function() {
			assert.throws(function() {
				server.start(CONTENT_DIR, NOT_FOUND_PAGE);
			});
		});

		it("runs callback when stop completes", function(done) {
			server.start(CONTENT_DIR, NOT_FOUND_PAGE, PORT);
			server.stop(function() {
				done();
			});
		});

		it("stop() provides error parameter if the server isn't running", function(done) {
			server.stop(function(err) {
				assert.defined(err);
				done();
			});
		});

		function httpGet(url, callback) {
			server.start(CONTENT_DIR, NOT_FOUND_PAGE, PORT, function() {
				http.get(url, function(response) {
					var receivedData = "";
					response.setEncoding("utf8");

					response.on("data", function(chunk) {
						receivedData += chunk;
					});
					response.on("error", function(err) {
						console.log("ERROR", err);
					});
					response.on("end", function() {
						server.stop(function() {
							callback(response, receivedData);
						});
					});
				});
			});
		}

	});


	describe("Socket.io Server", function() {

		it("test connects to the server", function(done) {
			server.start(CONTENT_DIR, NOT_FOUND_PAGE, PORT, function() {
				var socket = io("http://localhost:" + PORT);
				socket.on('connect', function() {
					server.stop(done);
				});
			});
		});

	});


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
		if (fs.existsSync(file)) {
			fs.unlink(file, function(err) {
				if (err || fs.existsSync(file)) console.log("could not delete test file: [" + file + "]. Error: " + err);
				done();
			});
		}
	}

}());