// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const ClientPointerEvent = require("../shared/client_pointer_event.js");
	const ClientRemovePointerEvent = require("../shared/client_remove_pointer_event.js");
	const ServerRemovePointerEvent = require("../shared/server_remove_pointer_event.js");
	const ClientDrawEvent = require("../shared/client_draw_event.js");
	const ClientClearScreenEvent = require("../shared/client_clear_screen_event.js");
	const EventRepository = require("./event_repository.js");
	const Clock = require("./clock.js");
	const EventEmitter = require("events");
	const SocketIoAbstraction = require("./socket_io_abstraction.js");

	// Consider Jay Bazuzi's suggestions from E494 comments (direct connection from client to server when testing)
	// http://disq.us/p/1gobws6  http://www.letscodejavascript.com/v3/comments/live/494

	// Consider Martin Grandrath's suggestions from E509 comments (different RealTimeServer initialization)
	// http://disq.us/p/1i1xydn  http://www.letscodejavascript.com/v3/comments/live/509

	const CLIENT_EVENT = "client_event";
	const SERVER_EVENT = "server_event";
	const CLIENT_TIMEOUT = 30 * 1000;
	const SUPPORTED_EVENTS = [
		ClientPointerEvent,
		ClientRemovePointerEvent,
		ClientDrawEvent,
		ClientClearScreenEvent
	];

	const RealTimeServer = module.exports = class RealTimeServer {

		constructor(clock = new Clock()) {
			this._clock = clock;
			this._socketIoAbstraction = new SocketIoAbstraction();
		}

		start(httpServer) {
			this._socketIoAbstraction.start(httpServer);
			const ioServer = this._socketIoAbstraction._ioServer;
			this._socketIoConnections = this._socketIoAbstraction._socketIoConnections;

			this._eventRepo = new EventRepository();
			this._emitter = new EventEmitter();

			handleSocketIoEvents(this, ioServer);
			handleClientTimeouts(this, ioServer);
		}

		stop() {
			this._interval.clear();
			this._socketIoAbstraction.stop();
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

		onNextClientEvent(callback) {
			this._emitter.once(CLIENT_EVENT, callback);
		}

		onNextServerEmit(callback) {
			this._emitter.once(SERVER_EVENT, callback);
		}

	};

	RealTimeServer.CLIENT_TIMEOUT = CLIENT_TIMEOUT;

	function handleSocketIoEvents(self, ioServer) {
		ioServer.on("connect", (socket) => {
			replayPreviousEvents(self, socket);
			handleClientEvents(self);

			socket.on("disconnect", () => {
				broadcastAndStoreEvent(self, socket.id, new ServerRemovePointerEvent(socket.id));
			});
		});
	}

	function handleClientTimeouts(self, ioServer) {
		self._lastActivity = {};

		self._interval = self._clock.setInterval(() => {
			Object.keys(self._lastActivity).forEach((socketId) => {
				const lastActivity = self._lastActivity[socketId];
				if (self._clock.millisecondsSince(lastActivity) >= CLIENT_TIMEOUT) {
					broadcastAndStoreEvent(self, null, new ServerRemovePointerEvent(socketId));
					delete self._lastActivity[socketId];
				}
			});
		}, 100);

		ioServer.on("connect", (socket) => {
			self._lastActivity[socket.id] = self._clock.now();

			self._socketIoAbstraction.on("clientEvent", () => {
				self._lastActivity[socket.id] = self._clock.now();
			});

			socket.on("disconnect", () => {
				delete self._lastActivity[socket.id];
			});
		});
	}

	function replayPreviousEvents(self, socket) {
		self._eventRepo.replay().forEach((event) => {
			socket.emit(event.name(), event.payload());
		});
	}

	function handleClientEvents(self) {
		self._socketIoAbstraction.on("clientEvent", (clientId, clientEvent) => {
			processClientEvent(self, clientId, clientEvent);
		});
	}

	function processClientEvent(self, clientId, clientEvent) {
		const id = clientId !== null ? clientId : "__SIMULATED__";
		const serverEvent = clientEvent.toServerEvent(id);
		broadcastAndStoreEvent(self, clientId, serverEvent);
		self._emitter.emit(CLIENT_EVENT, id, clientEvent);
	}

	function broadcastAndStoreEvent(self, clientIdOrNull, event) {
		self._eventRepo.store(event);
		if (clientIdOrNull) self._socketIoAbstraction.broadcastToAllClientsButOne(clientIdOrNull, event);
		else self._socketIoAbstraction.broadcastToAllClients(event);
		self._emitter.emit(SERVER_EVENT, event);
	}

}());