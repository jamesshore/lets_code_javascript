// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var http = require("http");
	var fs = require("fs");
	var send = require("send");
	var util = require("util");

	var HttpServer = module.exports = function HttpServer(contentDir, notFoundPageToServe) {
		this._httpServer = http.createServer();

		handleHttpRequests(this._httpServer, contentDir, notFoundPageToServe);
	};

	HttpServer.prototype.start = function(portNumber) {
		const listen = util.promisify(this._httpServer.listen.bind(this._httpServer));
		return listen(portNumber);
	};

	HttpServer.prototype.stop = function() {
		const close = util.promisify(this._httpServer.close.bind(this._httpServer));
		return close();
	};

	HttpServer.prototype.getNodeServer = function() {
		return this._httpServer;
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