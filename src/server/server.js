// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var http = require("http");
	var fs = require("fs");
	var send = require("send");
	var io = require('socket.io');
	var HttpServer = require("./http_server.js");
	var RealTimeServer = require("./real_time_server.js");

	var Server = module.exports = function Server() {};

	Server.prototype.start = function(contentDir, notFoundPageToServe, portNumber, callback) {
		if (!portNumber) throw "port number is required";

		var httpServer = new HttpServer();
		var self = this;
		httpServer.start(self, contentDir, notFoundPageToServe, portNumber, function() {
			// self._httpServer = http.createServer();
			// httpServer.handleHttpRequests(self._httpServer, contentDir, notFoundPageToServe);
			self._httpServer.listen(portNumber, function() {
				new RealTimeServer().start(self._httpServer);
			});
		});
	};

	Server.prototype.stop = function(callback) {
		if (this._httpServer === undefined) return callback(new Error("stop() called before server started"));

		this._httpServer.close(callback);
	};

	function handleHttpRequests(httpServer, contentDir, notFoundPageToServe) {
		httpServer.on("request", function(request, response) {
			send(request, request.url, { root: contentDir }).on("error", handleError).pipe(response);

			function handleError(err) {
				if (err.status === 404) serveErrorFile(response, 404, contentDir + "/" + notFoundPageToServe);
				else throw err;
			}
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