// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var http = require("http");
	var fs = require("fs");
	var send = require("send");
	var io = require('socket.io');
	var ClientPointerEvent = require("../shared/client_pointer_event.js");
	var ClientRemovePointerEvent = require("../shared/client_remove_pointer_event.js");
	var ClientDrawEvent = require("../shared/client_draw_event.js");
	var ClientClearScreenEvent = require("../shared/client_clear_screen_event.js");
	var EventRepository = require("./event_repository.js");

	var Server = module.exports = function Server() {};

	Server.prototype.start = function(contentDir, notFoundPageToServe, portNumber, callback) {
		if (!portNumber) throw "port number is required";

		this._httpServer = http.createServer();
		handleHttpRequests(this._httpServer, contentDir, notFoundPageToServe);

		this._ioServer = io(this._httpServer);
		handleSocketIoEvents(this, this._ioServer);

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

	function handleSocketIoEvents(self, ioServer) {
		self._eventRepo = new EventRepository();

		ioServer.on("connect", function(socket) {
			replayPreviousEvents(self, socket);
			reflectClientEventsWithId(self, socket);
			reflectClientEventsWithoutId(self, socket);
		});
	}

	function replayPreviousEvents(self, socket) {
		self._eventRepo.replay().forEach(function(event) {
			socket.emit(event.name(), event.toSerializableObject());
		});
	}

	function reflectClientEventsWithId(self, socket) {
		var supportedEvents = [
			ClientPointerEvent,
			ClientRemovePointerEvent
		];

		supportedEvents.forEach(function(eventConstructor) {
			socket.on(eventConstructor.EVENT_NAME, function(eventData) {
				var clientEvent = eventConstructor.fromSerializableObject(eventData);
				var serverEvent = clientEvent.toServerEvent(socket.id);
				self._eventRepo.store(serverEvent);
				socket.broadcast.emit(serverEvent.name(), serverEvent.toSerializableObject());
			});
		});
	}

	function reflectClientEventsWithoutId(self, socket) {
		var supportedEvents = [
			ClientDrawEvent,
			ClientClearScreenEvent
		];

		supportedEvents.forEach(function(eventConstructor) {
			socket.on(eventConstructor.EVENT_NAME, function(eventData) {
				var clientEvent = eventConstructor.fromSerializableObject(eventData);
				var serverEvent = clientEvent.toServerEvent();
				self._eventRepo.store(serverEvent);
				socket.broadcast.emit(serverEvent.name(), serverEvent.toSerializableObject());
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