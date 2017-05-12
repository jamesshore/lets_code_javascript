// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var io = require('socket.io');
	var ClientPointerEvent = require("../shared/client_pointer_event.js");
	var ClientRemovePointerEvent = require("../shared/client_remove_pointer_event.js");
	var ClientDrawEvent = require("../shared/client_draw_event.js");
	var ClientClearScreenEvent = require("../shared/client_clear_screen_event.js");
	var EventRepository = require("./event_repository.js");

	// Consider Jay Bazuzi's suggestions from E494 comments (direct connection from client to server when testing)
	// http://disq.us/p/1gobws6  http://www.letscodejavascript.com/v3/comments/live/494

	var RealTimeServer = module.exports = function RealTimeServer() {
		this._activeConnections = {};
	};

	RealTimeServer.prototype.start = function(httpServer) {
		this._ioServer = io(httpServer);

		trackActiveConnections(this._activeConnections, httpServer);
		handleSocketIoEvents(this, this._ioServer);
	};

	RealTimeServer.prototype.stop = function(callback) {
		callback();
	};

	RealTimeServer.prototype.handleClientEvent = function(clientEvent, clientId) {
		var serverEvent = processClientEvent(this, clientEvent, clientId);
		this._ioServer.emit(serverEvent.name(), serverEvent.toSerializableObject());
	};

	RealTimeServer.prototype.numberOfActiveConnections = function() {
		return Object.keys(this._activeConnections).length;
	};

	function trackActiveConnections(connections, httpServer) {
		httpServer.on('connection', function(socket) {
			console.log("NEW CONNECTION", socket.remoteAddress, socket.remotePort);
			var key = socket.remoteAddress + ':' + socket.remotePort;
			connections[key] = socket;
			socket.on("close", function() {
				console.log("CLOSE CONNECTION", socket.remoteAddress, socket.remotePort);
				delete connections[key];
			});
		});
	}

	function processClientEvent(self, clientEvent, clientId) {
		var serverEvent = clientEvent.toServerEvent(clientId);
		self._eventRepo.store(serverEvent);
		return serverEvent;
	}

	function handleSocketIoEvents(self, ioServer) {
		self._eventRepo = new EventRepository();

		ioServer.on("connect", function(socket) {
			replayPreviousEvents(self, socket);
			handleClientEvents(self, socket);
		});
	}

	function replayPreviousEvents(self, socket) {
		self._eventRepo.replay().forEach(function(event) {
			// TODO: Deliberately incorrect. Needs to be socket.emit()!
			self._ioServer.emit(event.name(), event.toSerializableObject());
		});
	}

	function handleClientEvents(self, socket) {
		var supportedEvents = [
			ClientPointerEvent,
			ClientRemovePointerEvent,
			ClientDrawEvent,
			ClientClearScreenEvent
		];

		supportedEvents.forEach(function(eventConstructor) {
			socket.on(eventConstructor.EVENT_NAME, function(eventData) {
				var clientEvent = eventConstructor.fromSerializableObject(eventData);
				var serverEvent = processClientEvent(self, clientEvent, socket.id);
				socket.broadcast.emit(serverEvent.name(), serverEvent.toSerializableObject());
			});
		});
	}

}());