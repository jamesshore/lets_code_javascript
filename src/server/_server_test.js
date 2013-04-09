// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var server = require("./server.js");
	var http = require("http");
	var fs = require("fs");
	var assert = require("assert");

	var CONTENT_DIR = "generated/test";

	var INDEX_PAGE = "index.html";
	var OTHER_PAGE = "other.html";
	var NOT_FOUND_PAGE = "test404.html";

	var INDEX_PAGE_DATA = "This is index page file";
	var OTHER_PAGE_DATA = "This is another page";
	var NOT_FOUND_DATA = "This is 404 page file";

	var PORT = 5020;
	var BASE_URL = "http://localhost:" + PORT;

	exports.setUp = function(done) {
		fs.writeFileSync(CONTENT_DIR + "/" + INDEX_PAGE, INDEX_PAGE_DATA);
		fs.writeFileSync(CONTENT_DIR + "/" + OTHER_PAGE, OTHER_PAGE_DATA);
		fs.writeFileSync(CONTENT_DIR + "/" + NOT_FOUND_PAGE, NOT_FOUND_DATA);

		done();
	};

	exports.tearDown = function(done) {
		cleanUpFile(CONTENT_DIR + "/" + INDEX_PAGE);
		cleanUpFile(CONTENT_DIR + "/" + OTHER_PAGE);
		cleanUpFile(CONTENT_DIR + "/" + NOT_FOUND_PAGE);
		done();
	};

	exports.test_servesFilesFromDirectory = function(test) {
		httpGet(BASE_URL + "/" + INDEX_PAGE, function(response, responseData) {
			test.equals(200, response.statusCode, "status code");
			test.equals(INDEX_PAGE_DATA, responseData, "response text");
			test.done();
		});
	};

	exports.test_supportsMultipleFiles = function(test) {
		httpGet(BASE_URL + "/" + OTHER_PAGE, function(response, responseData) {
			test.equals(200, response.statusCode, "status code");
			test.equals(OTHER_PAGE_DATA, responseData, "response text");
			test.done();
		});
	};

	exports.test_servesIndexDotHtmlWhenAskedForHomePage = function(test) {
		httpGet(BASE_URL, function(response, responseData) {
			test.equals(200, response.statusCode, "status code");
			test.equals(INDEX_PAGE_DATA, responseData, "response text");
			test.done();
		});
	};

	exports.test_returns404WhenFileDoesNotExist = function(test) {
		httpGet(BASE_URL + "/bargle", function(response, responseData) {
			test.equals(404, response.statusCode, "status code");
			test.equals(NOT_FOUND_DATA, responseData, "404 text");
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
			server.start(CONTENT_DIR);
		});
		test.done();
	};

	exports.test_requiresPortParameter = function(test) {
		test.throws(function() {
			server.start(CONTENT_DIR, NOT_FOUND_PAGE);
		});
		test.done();
	};

	exports.test_runsCallbackWhenStopCompletes = function(test) {
		server.start(CONTENT_DIR, NOT_FOUND_PAGE, PORT);
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

	function cleanUpFile(file) {
		if (fs.existsSync(file)) {
			fs.unlinkSync(file);
			assert.ok(!fs.existsSync(file), "could not delete test file: [" + file + "]");
		}
	}

}());