// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var http = require("http");
	var fs = require("fs");
	var nodeStatic = require("node-static");
	var server;

	exports.start = function(homePageToServe, notFoundPageToServe, portNumber, callback) {
		if(!portNumber) throw "port number is required";

		server = http.createServer();
		server.on("request", function(request, response) {
			if (request.url === "/" || request.url === "/index.html") {
				serveFile(homePageToServe, 200, request, response);
			}
			else {
				serveFile(notFoundPageToServe, 404, request, response);
			}
		});
		server.listen(portNumber, callback);
	};

	exports.stop = function(callback) {
		server.close(callback);
	};

	// fileServer.serveFile(filepath, statusCode, headers, request, response);
	function serveFile(file, statusCode, request, response) {
		response.statusCode = statusCode;
		fs.readFile(file, function (err, data) {
			if (err) throw err;
			response.end(data);
		});
	}

}());