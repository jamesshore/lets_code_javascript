// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const ServerRemovePointerEvent = require("../shared/server_remove_pointer_event.js");
	const EventRepository = require("./event_repository.js");
	const Clock = require("./clock.js");
	const RealTimeServer = require("./real_time_server.js");

	// Consider Jay Bazuzi's suggestions from E494 comments (direct connection from client to server when testing)
	// http://disq.us/p/1gobws6  http://www.letscodejavascript.com/v3/comments/live/494

	const CLIENT_TIMEOUT = 30 * 1000;

	const RealTimeLogic = module.exports = class RealTimeLogic {

		constructor(realTimeServer, clock = new Clock()) {
			this._realTimeServer = realTimeServer;
			this._clock = clock;
			this._eventRepo = new EventRepository();
		}

		start() {
			handleRealTimeEvents(this);
			handleClientTimeouts(this);
		}

		stop() {
			stopHandlingClientTimeouts(this);
		}

		numberOfActiveConnections() {
			return this._realTimeServer.numberOfActiveConnections();
		}

	};

	RealTimeLogic.CLIENT_TIMEOUT = CLIENT_TIMEOUT;

	function handleRealTimeEvents(self) {
		self._realTimeServer.on(RealTimeServer.CLIENT_CONNECT, (clientId) => {
			replayPreviousEvents(self, clientId);
		});
		handleClientMessages(self);
		self._realTimeServer.on(RealTimeServer.CLIENT_DISCONNECT, (disconnectId) => {
			broadcastAndStoreEvent(self, null, new ServerRemovePointerEvent(disconnectId));
		});
	}

	function handleClientTimeouts(self) {
		self._lastActivity = {};

		self._interval = self._clock.setInterval(() => {
			timeOutClients();
		}, 100);
		self._realTimeServer.on(RealTimeServer.CLIENT_CONNECT, (clientId) => {
			resetClientTimeout(clientId);
		});
		self._realTimeServer.on(RealTimeServer.CLIENT_MESSAGE, (clientId) => {
			resetClientTimeout(clientId);
		});
		self._realTimeServer.on(RealTimeServer.CLIENT_DISCONNECT, (clientId) => {
			stopTrackingClient(clientId);
		});

		function resetClientTimeout(clientId) {
			self._lastActivity[clientId] = self._clock.now();
		}

		function stopTrackingClient(clientId) {
			delete self._lastActivity[clientId];
		}

		function timeOutClients() {
			Object.keys(self._lastActivity).forEach((clientId) => {
				const lastActivity = self._lastActivity[clientId];
				if (self._clock.millisecondsSince(lastActivity) >= CLIENT_TIMEOUT) {
					broadcastAndStoreEvent(self, null, new ServerRemovePointerEvent(clientId));
					stopTrackingClient(clientId);
				}
			});
		}
	}

	function stopHandlingClientTimeouts(self) {
		self._interval.clear();
	}

	function replayPreviousEvents(self, clientId) {
		self._eventRepo.replay().forEach((event) => {
			self._realTimeServer.sendToOneClient(clientId, event);
		});
	}

	function handleClientMessages(self) {
		self._realTimeServer.on(RealTimeServer.CLIENT_MESSAGE, (clientId, clientEvent) => {
			processClientEvent(self, clientId, clientEvent);
		});
	}

	function processClientEvent(self, clientId, clientEvent) {
		const id = clientId !== null ? clientId : "__SIMULATED__";
		const serverEvent = clientEvent.toServerEvent(id);
		broadcastAndStoreEvent(self, clientId, serverEvent);
	}

	function broadcastAndStoreEvent(self, clientIdOrNull, event) {
		self._eventRepo.store(event);
		if (clientIdOrNull) self._realTimeServer.broadcastToAllClientsButOne(clientIdOrNull, event);
		else self._realTimeServer.broadcastToAllClients(event);
	}

}());