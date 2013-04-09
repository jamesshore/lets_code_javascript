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
			fileServer.serve(request, response, function(err) {
				if (err) {
					if (err.status === 404) fileServer.serveFile(notFoundPageToServe, 404, {}, request, response);
					else throw err;
				}
			});
		});
		server.listen(portNumber, callback);
	};

	exports.stop = function(callback) {
		server.close(callback);
	};

}());