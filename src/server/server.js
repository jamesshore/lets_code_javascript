// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
"use strict";

var http = require("http");
var server;

exports.start = function() {
	console.log("start called");
	server = http.createServer();
	console.log("server called");

	server.on("request", function(request, response) {
		console.log("request called");
		response.end();
	});
	console.log("'on' called");

	server.listen(8080);
	console.log("listen called");
};

exports.stop = function(callback) {
	console.log("stop called");
	server.close(callback);
};