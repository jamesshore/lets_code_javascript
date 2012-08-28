// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.

// launch the server in the same way it happens in production
// get a page
// confirm we got something

(function() {
	"use strict";

	var jake = require("jake");
	var child_process = require("child_process");
	var http = require("http");

//	exports.test_for_smoke = function(test) {
//		runServer(function() {
//			console.log("callback called");
//			httpGet("http://localhost:8080", function(response, receivedData) {
//				console.log("got file");
//				test.done();
//			});
//		});
//	};

	function runServer(callback) {
		var child = child_process.spawn("node", ["src/server/weewikipaint", "8080"]);
		child.stdout.setEncoding("utf8");
		child.stdout.on("data", function(chunk) {
			process.stdout.write("server stdout: " + chunk);
			if (chunk.trim() === "Server started") callback();
		});
		child.stderr.on("data", function(chunk) {
			process.stdout.write("server stderr: " + chunk);
		});
		child.on("exit", function(code, signal) {
			console.log("Server process exited with code [" + code + "] and signal [" + signal + "]");
		});
	}

	// TODO: eliminate duplication w/ _server_test.js
	function httpGet(url, callback) {
		var request = http.get(url);
		request.on("response", function(response) {
			var receivedData = "";
			response.setEncoding("utf8");

			response.on("data", function(chunk) {
				receivedData += chunk;
			});
			response.on("end", function() {
				callback(response, receivedData);
			});
		});
	}

}());