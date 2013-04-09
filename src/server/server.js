// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var http = require("http");
	var fs = require("fs");
	var nodeStatic = require("node-static");
	var server;

	exports.start = function(contentDir, notFoundPageToServe, portNumber, callback) {
		if(!portNumber) throw "port number is required";

		var fileServer = new nodeStatic.Server(contentDir);

		server = http.createServer();
		server.on("request", function(request, response) {
			if (request.url === "/" || request.url === "/index.html") {
				serveFile("index.html", 200, request, response);
			}
			else {
				serveFile(notFoundPageToServe, 404, request, response);
			}
		});
		server.listen(portNumber, callback);

		// fileServer.serveFile(filepath, statusCode, headers, request, response);
		function serveFile(file, statusCode, request, response) {
			fileServer.serveFile(file, statusCode, null, request, response);
		}
	};

	exports.stop = function(callback) {
		server.close(callback);
	};

}());