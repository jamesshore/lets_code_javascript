// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var http = require("http");
	var fs = require("fs");
	var send = require("send");
	var server;

	exports.start = function(contentDir, notFoundPageToServe, portNumber, callback) {
		if (!portNumber) throw "port number is required";

		server = http.createServer();
		server.on("request", function(request, response) {
			send(request, request.url, { root: contentDir }).
				on("error", handleError).
				pipe(response);

			function handleError(err) {
				if (err.status === 404) serveErrorFile(response, 404, contentDir + "/" + notFoundPageToServe);
				else throw err;
			}
		});


		var io = require('socket.io')(server);

		server.listen(portNumber, callback);
	};

	exports.stop = function(callback) {
		server.close(callback);
	};

	function serveErrorFile(response, statusCode, file) {
		response.statusCode = statusCode;
		response.setHeader("Content-Type", "text/html; charset=UTF-8");
		fs.readFile(file, function(err, data) {
			if (err) throw err;
			response.end(data);
		});
	}

}());