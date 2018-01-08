// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const ServerRemovePointerEvent = require("../shared/server_remove_pointer_event.js");
	const EventRepository = require("./event_repository.js");
	const Clock = require("./clock.js");
	const EventEmitter = require("events");
	const RealTimeServer = require("./real_time_server.js");

	// Consider Jay Bazuzi's suggestions from E494 comments (direct connection from client to server when testing)
	// http://disq.us/p/1gobws6  http://www.letscodejavascript.com/v3/comments/live/494

	const CLIENT_EVENT = "client_event";
	const SERVER_EVENT = "server_event";
	const CLIENT_TIMEOUT = 30 * 1000;

	const RealTimeLogic = module.exports = class RealTimeLogic {

		constructor(realTimeServer, clock = new Clock()) {
			this._realTimeServer = realTimeServer;
			this._clock = clock;
		}

		start() {
			this._eventRepo = new EventRepository();
			this._emitter = new EventEmitter();

			handleRealTimeEvents(this);
			handleClientTimeouts(this);
		}

		stop() {
			this._interval.clear();
			this._realTimeServer.stop();
		}

		numberOfActiveConnections() {
			return this._realTimeServer.numberOfActiveConnections();
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

	RealTimeLogic.CLIENT_TIMEOUT = CLIENT_TIMEOUT;

	function handleRealTimeEvents(self) {
		self._realTimeServer.on(RealTimeServer.CLIENT_CONNECT, (clientId) => {
			replayPreviousEvents(self, clientId);
			handleClientEvents(self);

			self._realTimeServer.on(RealTimeServer.CLIENT_DISCONNECT, () => {
				broadcastAndStoreEvent(self, null, new ServerRemovePointerEvent(clientId));
			});
		});
	}

	function handleClientTimeouts(self) {
		self._lastActivity = {};

		self._interval = self._clock.setInterval(() => {
			Object.keys(self._lastActivity).forEach((clientId) => {
				const lastActivity = self._lastActivity[clientId];
				if (self._clock.millisecondsSince(lastActivity) >= CLIENT_TIMEOUT) {
					broadcastAndStoreEvent(self, null, new ServerRemovePointerEvent(clientId));
					delete self._lastActivity[clientId];
				}
			});
		}, 100);

		self._realTimeServer.on(RealTimeServer.CLIENT_CONNECT, (clientId) => {
			self._lastActivity[clientId] = self._clock.now();

			self._realTimeServer.on(RealTimeServer.CLIENT_EVENT_RECEIVED, () => {
				self._lastActivity[clientId] = self._clock.now();
			});

			self._realTimeServer.on(RealTimeServer.CLIENT_DISCONNECT, () => {
				delete self._lastActivity[clientId];
			});
		});
	}

	function replayPreviousEvents(self, clientId) {
		self._eventRepo.replay().forEach((event) => {
			self._realTimeServer.sendToOneClient(clientId, event);
		});
	}

	function handleClientEvents(self) {
		self._realTimeServer.on(RealTimeServer.CLIENT_EVENT_RECEIVED, (clientId, clientEvent) => {
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
		if (clientIdOrNull) self._realTimeServer.broadcastToAllClientsButOne(clientIdOrNull, event);
		else self._realTimeServer.broadcastToAllClients(event);
		self._emitter.emit(SERVER_EVENT, event);
	}

}());