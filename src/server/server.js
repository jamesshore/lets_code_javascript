// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
"use strict";

var http = require("http");
var server;

exports.start = function() {
	server = http.createServer();
	server.on("request", function(request, response) {
		response.end();
	});
	server.listen(8080);    //TODO: Remove duplication
};

exports.stop = function(callback) {
	server.close(callback);
};