// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var http = require("http");
	var fs = require("fs");
	var send = require("send");
	var io = require('socket.io');

	var httpServer;
	var ioServer;


	exports.start = function(contentDir, notFoundPageToServe, portNumber, callback) {
		if (!portNumber) throw "port number is required";

		httpServer = http.createServer();
		handleHttpRequests(contentDir, notFoundPageToServe);

		ioServer = io(httpServer);
		handleSocketIoEvents();

		httpServer.listen(portNumber, callback);
	};

	exports.stop = function(callback) {
		httpServer.close(callback);
	};

	function handleHttpRequests(contentDir, notFoundPageToServe) {
		httpServer.on("request", function(request, response) {
			send(request, request.url, { root: contentDir }).on("error", handleError).pipe(response);

			function handleError(err) {
				if (err.status === 404) serveErrorFile(response, 404, contentDir + "/" + notFoundPageToServe);
				else throw err;
			}
		});
	}

	function handleSocketIoEvents() {
		ioServer.on("connect", function(socket) {
			socket.on("mouse", function(data) {
				socket.broadcast.emit("mouse", data);
			});
		});
	}

	function serveErrorFile(response, statusCode, file) {
		response.statusCode = statusCode;
		response.setHeader("Content-Type", "text/html; charset=UTF-8");
		fs.readFile(file, function(err, data) {
			if (err) throw err;
			response.end(data);
		});
	}

}());