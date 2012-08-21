// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
"use strict";

var server = require("./server.js");
var http = require("http");
var fs = require("fs");

exports.test_serverReturnsHelloWorld = function(test) {
	server.start(8080);
	var request = http.get("http://localhost:8080");
	request.on("response", function(response) {
		var receivedData = false;
		response.setEncoding("utf8");

		test.equals(200, response.statusCode, "status code");
		response.on("data", function(chunk) {
			receivedData = true;
			test.equals("Hello World", chunk, "response text");
		});
		response.on("end", function() {
			test.ok(receivedData, "should have received response data");
			server.stop(function() {
				test.done();
			});
		});
	});
};

exports.test_serverServesAFile = function(test) {
	var testDir = "generated/test";
	var testFile = testDir + "/test.html";

	try {
		fs.writeFileSync(testFile, "Hello world");
		test.done();
	}
	finally {
		fs.unlinkSync(testFile);
		test.ok(!fs.existsSync(testFile), "file should have been deleted");
	}
};

exports.test_serverRequiresPortNumber = function(test) {
	test.throws(function() {
		server.start();
	});
	test.done();
};

exports.test_serverRunsCallbackWhenStopCompletes = function(test) {
	server.start(8080);
	server.stop(function() {
		test.done();
	});
};

exports.test_stopCalledWhenServerIsntRunningThrowsException = function(test) {
	test.throws(function() {
		server.stop();
	});
	test.done();
};
