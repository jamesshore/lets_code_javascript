// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const ServerRemovePointerMessage = require("../shared/server_remove_pointer_message.js");
	const MessageRepository = require("./message_repository.js");
	const Clock = require("./clock.js");
	const RealTimeServer = require("./real_time_server.js");

	// Consider Jay Bazuzi's suggestions from E494 comments (direct connection from client to server when testing)
	// http://disq.us/p/1gobws6  http://www.letscodejavascript.com/v3/comments/live/494

	const CLIENT_TIMEOUT = 3 * 1000;

	const RealTimeLogic = module.exports = class RealTimeLogic {

		constructor(realTimeServer, clock = new Clock()) {
			this._realTimeServer = realTimeServer;
			this._clock = clock;
			this._messageRepo = new MessageRepository();
		}

		start() {
			handleRealTimeEvents(this);
			handleClientTimeouts(this);
		}

		stop() {
			stopHandlingClientTimeouts(this);
		}

	};

	RealTimeLogic.CLIENT_TIMEOUT = CLIENT_TIMEOUT;

	function handleRealTimeEvents(self) {
		self._realTimeServer.on(RealTimeServer.CLIENT_CONNECT, (clientId) => {
			replayPreviousMessages(self, clientId);
		});
		handleClientMessages(self);
		self._realTimeServer.on(RealTimeServer.CLIENT_DISCONNECT, (disconnectId) => {
			broadcastAndStoreMessage(self, null, new ServerRemovePointerMessage(disconnectId));
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
					broadcastAndStoreMessage(self, null, new ServerRemovePointerMessage(clientId));
					stopTrackingClient(clientId);
				}
			});
		}
	}

	function stopHandlingClientTimeouts(self) {
		self._interval.clear();
	}

	function replayPreviousMessages(self, clientId) {
		self._messageRepo.replay().forEach((message) => {
			self._realTimeServer.sendToOneClient(clientId, message);
		});
	}

	function handleClientMessages(self) {
		self._realTimeServer.on(RealTimeServer.CLIENT_MESSAGE, (clientId, clientMessage) => {
			processClientEvent(self, clientId, clientMessage);
		});
	}

	function processClientEvent(self, clientId, clientMessage) {
		const id = clientId !== null ? clientId : "__SIMULATED__";
		const serverMessage = clientMessage.toServerMessage(id);
		broadcastAndStoreMessage(self, clientId, serverMessage);
	}

	function broadcastAndStoreMessage(self, clientIdOrNull, message) {
		self._messageRepo.store(message);
		if (clientIdOrNull) self._realTimeServer.broadcastToAllClientsButOne(clientIdOrNull, message);
		else self._realTimeServer.broadcastToAllClients(message);
	}

}());