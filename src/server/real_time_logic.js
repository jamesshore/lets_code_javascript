// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const ServerRemovePointerMessage = require("../shared/server_remove_pointer_message.js");
	const ServerPointerMessage = require("../shared/server_pointer_message.js");
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
			handleClientTimeouts(this);
			handleRealTimeEvents(this);
		}

		stop() {
			stopHandlingClientTimeouts(this);
		}

	};

	RealTimeLogic.CLIENT_TIMEOUT = CLIENT_TIMEOUT;

	function handleRealTimeEvents(self) {
		self._realTimeServer.on(RealTimeServer.EVENT.CLIENT_CONNECT, replayPreviousMessages);
		self._realTimeServer.on(RealTimeServer.EVENT.CLIENT_MESSAGE, processClientMessage);
		self._realTimeServer.on(RealTimeServer.EVENT.CLIENT_DISCONNECT, removeClientPointer);

		function replayPreviousMessages(clientId) {
			self._messageRepo.replay().forEach((message) => {
				self._realTimeServer.sendToOneClient(clientId, message);
			});
		}

		function processClientMessage({ clientId, message }) {
			broadcastAndStoreMessage(self, clientId, message.toServerMessage(clientId));
		}

		function removeClientPointer(clientId) {
			broadcastAndStoreMessage(self, null, new ServerRemovePointerMessage(clientId));
		}
	}

	function handleClientTimeouts(self) {
		self._lastActivity = {};

		self._realTimeServer.on(RealTimeServer.EVENT.CLIENT_CONNECT, startTrackingClient);
		self._realTimeServer.on(RealTimeServer.EVENT.CLIENT_MESSAGE, updateClient);
		self._realTimeServer.on(RealTimeServer.EVENT.CLIENT_DISCONNECT, stopTrackingClient);
		self._interval = self._clock.setInterval(timeOutInactiveClients, 100);

		function startTrackingClient(clientId) {
			resetClientTimeout(clientId);
		}

		function updateClient({ clientId }) {
			if (!isTrackingClient(clientId)) {
				startTrackingClient();
				broadcastAndStoreMessage(self, clientId, new ServerPointerMessage(clientId, 42, 42));
			}
			else {
				resetClientTimeout(clientId);
			}
		}

		function stopTrackingClient(clientId) {
			delete self._lastActivity[clientId];
		}

		function timeOutInactiveClients() {
			Object.keys(self._lastActivity).forEach((clientId) => {
				const lastActivity = self._lastActivity[clientId];
				if (self._clock.millisecondsSince(lastActivity) >= CLIENT_TIMEOUT) {
					broadcastAndStoreMessage(self, null, new ServerRemovePointerMessage(clientId));
					stopTrackingClient(clientId);
				}
			});
		}

		function isTrackingClient(clientId) {
			return self._lastActivity[clientId] !== undefined;
		}

		function resetClientTimeout(clientId) {
			self._lastActivity[clientId] = self._clock.now();
		}
	}

	function stopHandlingClientTimeouts(self) {
		self._interval.clear();
	}

	function broadcastAndStoreMessage(self, clientIdOrNull, message) {
		self._messageRepo.store(message);
		if (clientIdOrNull) self._realTimeServer.broadcastToAllClientsButOne(clientIdOrNull, message);
		else self._realTimeServer.broadcastToAllClients(message);
	}

}());