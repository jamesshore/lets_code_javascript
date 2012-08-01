// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
"use strict";

var server = require("./server.js");
var http = require("http");

exports.tearDown = function(done) {
	server.stop(function() {
		done();
	});
};

//TODO: handle case where stop() is called before start()
//TODO: test-drive stop() callback

exports.testServerRespondsToGetRequests = function(test) {
	server.start();
	http.get("http://localhost:8080", function(response) {
		test.done();
	});
};
