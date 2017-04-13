// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var http = require("http");
	var fs = require("fs");
	var send = require("send");

	var HttpServer = module.exports = function HttpServer(contentDir, notFoundPageToServe) {
		this._httpServer = http.createServer();

		this.handleHttpRequests(this._httpServer, contentDir, notFoundPageToServe);
	};

	HttpServer.prototype.start = function(portNumber, callback) {
		this._httpServer.listen(portNumber, callback);
	};

	HttpServer.prototype.stop = function(callback) {
		this._httpServer.close(callback);
	};

	HttpServer.prototype.handleHttpRequests = function handleHttpRequests(httpServer, contentDir, notFoundPageToServe) {
		httpServer.on("request", function(request, response) {
			send(request, request.url, { root: contentDir }).on("error", handleError).pipe(response);

			function handleError(err) {
				if (err.status === 404) serveErrorFile(response, 404, contentDir + "/" + notFoundPageToServe);
				else throw err;
			}
		});
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