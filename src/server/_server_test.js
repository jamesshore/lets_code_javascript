// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
"use strict";

var server = require("./server.js");
var http = require("http");

exports.tearDown = function(test) {
	console.log("tear down start");
	server.stop(function() {
		console.log("stop callback");
		//TODO: need test.done() equivalent here
	});
	console.log("tear down end");
};

//TODO: handle case where stop() is called before start()
//TODO: test-drive stop() callback

exports.testHttpServer = function(test) {
	console.log("test started");
	server.start();
	console.log("server started");

	http.get("http://localhost:8080", function(response) {
		console.log("response callback");
		test.done();
		console.log("test done");
	});
	console.log("get called");
};
