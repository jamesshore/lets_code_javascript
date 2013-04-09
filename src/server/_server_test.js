// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var server = require("./server.js");
	var http = require("http");
	var fs = require("fs");
	var assert = require("assert");

	var TEST_CONTENT_DIR = "generated/test";
	var TEST_HOME_PAGE = TEST_CONTENT_DIR + "/index.html";
	var TEST_404_PAGE = "test404.html";

	var PORT = 5020;
	var BASE_URL = "http://localhost:" + PORT;

	exports.tearDown = function(done) {
		cleanUpFile(TEST_HOME_PAGE);
		cleanUpFile(TEST_CONTENT_DIR + "/" + TEST_404_PAGE);
		done();
	};

	exports.test_servesHomePageFromFile = function(test) {
		var expectedData = "This is home page file";
		fs.writeFileSync(TEST_HOME_PAGE, expectedData);

		httpGet(BASE_URL, function(response, responseData) {
			test.equals(200, response.statusCode, "status code");
			test.equals(expectedData, responseData, "response text");
			test.done();
		});
	};

	exports.test_returns404FromFileForEverythingExceptHomePage = function(test) {
		var expectedData = "This is 404 page file";
		fs.writeFileSync(TEST_CONTENT_DIR + "/" + TEST_404_PAGE, expectedData);

		httpGet(BASE_URL + "/bargle", function(response, responseData) {
			test.equals(404, response.statusCode, "status code");
			test.equals(expectedData, responseData, "404 text");
			test.done();
		});
	};

	exports.test_returnsHomePageWhenAskedForIndex = function(test) {
		var testDir = "generated/test";
		fs.writeFileSync(TEST_CONTENT_DIR + "/" + TEST_404_PAGE, "404 page");
		fs.writeFileSync(TEST_HOME_PAGE, "foo");

		httpGet(BASE_URL + "/index.html", function(response, responseData) {
			test.equals(200, response.statusCode, "status code");
			test.done();
		});
	};

	exports.test_requiresHomePageParameter = function(test) {
		test.throws(function() {
			server.start();
		});
		test.done();
	};

	exports.test_requires404PageParameter = function(test) {
		test.throws(function() {
			server.start(TEST_CONTENT_DIR);
		});
		test.done();
	};

	exports.test_requiresPortParameter = function(test) {
		test.throws(function() {
			server.start(TEST_CONTENT_DIR, TEST_404_PAGE);
		});
		test.done();
	};

	exports.test_runsCallbackWhenStopCompletes = function(test) {
		server.start(TEST_CONTENT_DIR, TEST_404_PAGE, PORT);
		server.stop(function() {
			test.done();
		});
	};

	exports.test_stopThrowsExceptionWhenNotRunning = function(test) {
		test.throws(function() {
			server.stop();
		});
		test.done();
	};

	function httpGet(url, callback) {
		server.start(TEST_CONTENT_DIR, TEST_404_PAGE, PORT, function() {
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

	function cleanUpFile(file) {
		if (fs.existsSync(file)) {
			fs.unlinkSync(file);
			assert.ok(!fs.existsSync(file), "could not delete test file: [" + file + "]");
		}
	}

}());