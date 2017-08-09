// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var io = require('socket.io');
	var ClientPointerEvent = require("../shared/client_pointer_event.js");
	var ClientRemovePointerEvent = require("../shared/client_remove_pointer_event.js");
	var ServerRemovePointerEvent = require("../shared/server_remove_pointer_event.js");
	var ClientDrawEvent = require("../shared/client_draw_event.js");
	var ClientClearScreenEvent = require("../shared/client_clear_screen_event.js");
	var EventRepository = require("./event_repository.js");
	var util = require("util");

	// Consider Jay Bazuzi's suggestions from E494 comments (direct connection from client to server when testing)
	// http://disq.us/p/1gobws6  http://www.letscodejavascript.com/v3/comments/live/494

	// Consider Martin Grandrath's suggestions from E509 comments (different RealTimeServer initialization)
	// http://disq.us/p/1i1xydn  http://www.letscodejavascript.com/v3/comments/live/509

	var RealTimeServer = module.exports = function RealTimeServer() {
		this._socketIoConnections = {};
	};

	RealTimeServer.prototype.start = function(httpServer) {
		this._httpServer = httpServer;
		this._ioServer = io(this._httpServer);
		this._eventRepo = new EventRepository();

		trackSocketIoConnections(this._socketIoConnections, this._ioServer);
		handleSocketIoEvents(this, this._ioServer);

		this._httpServer.on("close", failFastIfHttpServerClosed);
	};

	function failFastIfHttpServerClosed() {
		throw new Error(
			"Do not call httpServer.stop() when using RealTimeServer--it will trigger this bug: " +
			"https://github.com/socketio/socket.io/issues/2975"
		);
	}

	RealTimeServer.prototype.stop = function() {
		const close = util.promisify(this._ioServer.close.bind(this._ioServer));

		this._httpServer.removeListener("close", failFastIfHttpServerClosed);
		return close();
	};

	RealTimeServer.prototype.numberOfActiveConnections = function() {
		return Object.keys(this._socketIoConnections).length;
	};

	RealTimeServer.prototype.isSocketConnected = function(socketId) {
		return this._socketIoConnections[socketId] !== undefined;
	};

	RealTimeServer.prototype.simulateClientEvent = function(clientEvent) {
		processClientEvent(this, null, clientEvent);
	};

	function handleSocketIoEvents(self, ioServer) {
		ioServer.on("connect", function(socket) {
			replayPreviousEvents(self, socket);
			handleClientEvents(self, socket);

			socket.on("disconnect", () => {
				var disconnectEvent = new ServerRemovePointerEvent(socket.id);
				self._eventRepo.store(disconnectEvent);
				socket.broadcast.emit(disconnectEvent.name(), disconnectEvent.toSerializableObject());
			});
		});
	}

	function replayPreviousEvents(self, socket) {
		self._eventRepo.replay().forEach((event) => {
			socket.emit(event.name(), event.toSerializableObject());
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
				processClientEvent(self, socket, clientEvent, socket.id);
			});
		});
	}

	function processClientEvent(self, clientSocket, clientEvent) {
		const clientId = clientSocket ? clientSocket.id : "__SIMULATED__";
		const serverEvent = clientEvent.toServerEvent(clientId);
		self._eventRepo.store(serverEvent);

		if (clientSocket) clientSocket.broadcast.emit(serverEvent.name(), serverEvent.toSerializableObject());
		else self._ioServer.emit(serverEvent.name(), serverEvent.toSerializableObject());
	}

	function trackSocketIoConnections(connections, ioServer) {
		// Inspired by isaacs
		// https://github.com/isaacs/server-destroy/commit/71f1a988e1b05c395e879b18b850713d1774fa92
		ioServer.on("connection", function(socket) {
			var key = socket.id;
			connections[key] = true;
			socket.on("disconnect", function() {
				delete connections[key];
			});
		});
	}

}());