// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const io = require('socket.io');
	const ClientPointerEvent = require("../shared/client_pointer_event.js");
	const ClientRemovePointerEvent = require("../shared/client_remove_pointer_event.js");
	const ServerRemovePointerEvent = require("../shared/server_remove_pointer_event.js");
	const ClientDrawEvent = require("../shared/client_draw_event.js");
	const ClientClearScreenEvent = require("../shared/client_clear_screen_event.js");
	const EventRepository = require("./event_repository.js");
	const util = require("util");
	const Clock = require("./clock.js");

	// Consider Jay Bazuzi's suggestions from E494 comments (direct connection from client to server when testing)
	// http://disq.us/p/1gobws6  http://www.letscodejavascript.com/v3/comments/live/494

	// Consider Martin Grandrath's suggestions from E509 comments (different RealTimeServer initialization)
	// http://disq.us/p/1i1xydn  http://www.letscodejavascript.com/v3/comments/live/509

	module.exports = class RealTimeServer {

		constructor(clock = new Clock()) {
			this._clock = clock;
			this._socketIoConnections = {};
		}

		start(httpServer) {
			this._httpServer = httpServer;
			this._ioServer = io(this._httpServer);
			this._eventRepo = new EventRepository();

			trackSocketIoConnections(this._socketIoConnections, this._ioServer);
			handleSocketIoEvents(this, this._ioServer);
			handleClientTimeouts(this, this._ioServer);

			this._httpServer.on("close", failFastIfHttpServerClosed);
		}

		stop() {
			const close = util.promisify(this._ioServer.close.bind(this._ioServer));

			this._interval.clear();
			this._httpServer.removeListener("close", failFastIfHttpServerClosed);
			return close();
		}

		numberOfActiveConnections() {
			return Object.keys(this._socketIoConnections).length;
		}

		isSocketConnected(socketId) {
			return this._socketIoConnections[socketId] !== undefined;
		}

		simulateClientEvent(clientEvent) {
			processClientEvent(this, null, clientEvent);
		}

	};

	function handleSocketIoEvents(self, ioServer) {
		ioServer.on("connect", (socket) => {
			replayPreviousEvents(self, socket);
			handleClientEvents(self, socket);

			socket.on("disconnect", () => {
				broadcastAndStoreEvent(self, socket, new ServerRemovePointerEvent(socket.id));
			});
		});
	}

	function handleClientTimeouts(self, ioServer) {
		self._lastActivity = {};

		self._interval = self._clock.setInterval(() => {
			Object.keys(self._lastActivity).forEach((socketId) => {
				const lastActivity = self._lastActivity[socketId];
				if (self._clock.millisecondsSince(lastActivity) >= 1000) {
					broadcastAndStoreEvent(self, null, new ServerRemovePointerEvent(socketId));
				}
			});
		}, 100);

		ioServer.on("connect", (socket) => {
			self._lastActivity[socket.id] = self._clock.now();
			socket.on(ClientPointerEvent.EVENT_NAME, () => {
				self._lastActivity[socket.id] = self._clock.now();
			});
		});
	}

	function replayPreviousEvents(self, socket) {
		self._eventRepo.replay().forEach((event) => {
			socket.emit(event.name(), event.payload());
		});
	}

	function handleClientEvents(self, socket) {
		const supportedEvents = [
			ClientPointerEvent,
			ClientRemovePointerEvent,
			ClientDrawEvent,
			ClientClearScreenEvent
		];

		supportedEvents.forEach(function(eventConstructor) {
			socket.on(eventConstructor.EVENT_NAME, function(eventData) {
				const clientEvent = eventConstructor.fromPayload(eventData);
				processClientEvent(self, socket, clientEvent, socket.id);
			});
		});
	}

	function processClientEvent(self, clientSocket, clientEvent) {
		const serverEvent = clientEvent.toServerEvent(clientSocket ? clientSocket.id : "__SIMULATED__");
		broadcastAndStoreEvent(self, clientSocket, serverEvent);
	}

	function broadcastAndStoreEvent(self, clientSocketOrNull, event) {
		self._eventRepo.store(event);
		if (clientSocketOrNull) clientSocketOrNull.broadcast.emit(event.name(), event.payload());
		else self._ioServer.emit(event.name(), event.payload());
	}

	function failFastIfHttpServerClosed() {
		throw new Error(
			"Do not call httpServer.stop() when using RealTimeServer--it will trigger this bug: " +
			"https://github.com/socketio/socket.io/issues/2975"
		);
	}

	function trackSocketIoConnections(connections, ioServer) {
		// Inspired by isaacs
		// https://github.com/isaacs/server-destroy/commit/71f1a988e1b05c395e879b18b850713d1774fa92
		ioServer.on("connection", function(socket) {
			const key = socket.id;
			connections[key] = true;
			socket.on("disconnect", function() {
				delete connections[key];
			});
		});
	}

}());