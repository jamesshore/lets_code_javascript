// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var http = require("http");
	var fs = require("fs");
	var send = require("send");
	var io = require('socket.io');
	var NetworkPointerEvent = require("../shared/network_pointer_event.js");

	var Server = module.exports = function Server() {};

	Server.prototype.start = function(contentDir, notFoundPageToServe, portNumber, callback) {
		if (!portNumber) throw "port number is required";

		this._httpServer = http.createServer();
		handleHttpRequests(this._httpServer, contentDir, notFoundPageToServe);

		this._ioServer = io(this._httpServer);
		handleSocketIoEvents(this._ioServer);

		this._httpServer.listen(portNumber, callback);
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

	function handleSocketIoEvents(ioServer) {
		ioServer.on("connect", function(socket) {
			socket.on("mouse", function(data) {
				var event = new NetworkPointerEvent(socket.id, data.x, data.y);
				socket.broadcast.emit(NetworkPointerEvent.EVENT_NAME, event);
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