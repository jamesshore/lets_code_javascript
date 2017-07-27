// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var HttpServer = require("./http_server.js");
	var assert = require("_assert");
	var async = require("async");
	var http = require("http");
	var fs = require("fs");

	var CONTENT_DIR = "generated/test";
	var IRRELEVANT_DIR = "irrelevant";

	var INDEX_PAGE = "index.html";
	var OTHER_PAGE = "other.html";
	var NOT_FOUND_PAGE = "test404.html";
	var IRRELEVANT_PAGE = "irrelevant";

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

		let server;

		beforeEach(function(done) {
			async.each(TEST_FILES, createTestFile, function() {
				server = new HttpServer(CONTENT_DIR, NOT_FOUND_PAGE);
				server.start(PORT).then(done);
			});
		});

		afterEach(function(done) {
			async.each(TEST_FILES, deleteTestFile, function() {
				server.stop().then(done);
			});
		});

		it("serves files from directory", async () => {
			let [ response, responseData ] = await httpGet(BASE_URL + "/" + INDEX_PAGE);
			assert.equal(response.statusCode, 200, "status code");
			assert.equal(responseData, INDEX_PAGE_DATA, "response text");
		});

		it("sets content-type and charset for HTML files", async () => {
			let [ response ] = await httpGet(BASE_URL + "/" + INDEX_PAGE);
			assert.equal(response.headers["content-type"], "text/html; charset=UTF-8", "content-type header");
		});

		it("supports multiple files", async () => {
			let [ response, responseData ] = await httpGet(BASE_URL + "/" + OTHER_PAGE);
			assert.equal(response.statusCode, 200, "status code");
			assert.equal(responseData, OTHER_PAGE_DATA, "response text");
		});

		it("serves index.html when asked for home page", async () => {
			let [ response, responseData ] = await httpGet(BASE_URL);
			assert.equal(response.statusCode, 200, "status code");
			assert.equal(responseData, INDEX_PAGE_DATA, "response text");
		});

		it("returns 404 when file doesn't exist", async () => {
			let [ response, responseData ] = await httpGet(BASE_URL + "/bargle");
			assert.equal(response.statusCode, 404, "status code");
			assert.equal(responseData, NOT_FOUND_DATA, "404 text");
		});

		it("sets content-type and charset for 404 page", async () => {
			let [ response ] = await httpGet(BASE_URL + "/bargle");
			assert.equal(response.headers["content-type"], "text/html; charset=UTF-8", "content-type header");
		});

		function httpGet(url) {
			return new Promise((resolve, reject) => {
				http.get(url, function(response) {
					var receivedData = "";
					response.setEncoding("utf8");

					response.on("data", function(chunk) {
						receivedData += chunk;
					});
					response.on("error", reject);
					response.on("end", function() {
						resolve([ response, receivedData ]);
					});
				});
			});
		}

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