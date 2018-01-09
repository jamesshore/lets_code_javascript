// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const io = require("socket.io");
	const failFast = require("fail_fast.js");
	const util = require("util");
	const EventEmitter = require("events");
	const ClientPointerEvent = require("../shared/client_pointer_event.js");
	const ClientRemovePointerEvent = require("../shared/client_remove_pointer_event.js");
	const ClientDrawEvent = require("../shared/client_draw_event.js");
	const ClientClearScreenEvent = require("../shared/client_clear_screen_event.js");

	const SUPPORTED_EVENTS = [
		ClientPointerEvent,
		ClientRemovePointerEvent,
		ClientDrawEvent,
		ClientClearScreenEvent
	];

	const SocketIoAbstraction = module.exports = class SocketIoAbstraction extends EventEmitter {

		constructor() {
			super();
			this._socketIoConnections = {};
		}

		start(httpServer) {
			failFast.unlessDefined(httpServer, "httpServer");

			this._httpServer = httpServer;
			this._ioServer = io(this._httpServer);
			this._httpServer.on("close", failFastIfHttpServerClosed);

			trackSocketIoConnections(this, this._socketIoConnections, this._ioServer);
			listenForClientEvents(this, this._ioServer);
		}

		stop() {
			const close = util.promisify(this._ioServer.close.bind(this._ioServer));

			this._httpServer.removeListener("close", failFastIfHttpServerClosed);
			return close();
		}

		sendToOneClient(clientId, event) {
			const socket = lookUpSocket(this, clientId);
			socket.emit(event.name(), event.payload());
		}

		broadcastToAllClients(event) {
			this._ioServer.emit(event.name(), event.payload());
		}

		broadcastToAllClientsButOne(clientToExclude, event) {
			const socket = lookUpSocket(this, clientToExclude);
			socket.broadcast.emit(event.name(), event.payload());
		}

		isClientConnected(clientId) {
			return this._socketIoConnections[clientId] !== undefined;
		}

		numberOfActiveConnections() {
			return Object.keys(this._socketIoConnections).length;
		}

	};

	SocketIoAbstraction.CLIENT_DISCONNECT = "clientDisconnect";
	SocketIoAbstraction.CLIENT_CONNECT = "clientConnect";
	SocketIoAbstraction.CLIENT_EVENT_RECEIVED = "clientEvent";


	function trackSocketIoConnections(self, connections, ioServer) {
		// Inspired by isaacs
		// https://github.com/isaacs/server-destroy/commit/71f1a988e1b05c395e879b18b850713d1774fa92
		ioServer.on("connection", function(socket) {
			const clientId = socket.id;
			connections[clientId] = socket;
			socket.on("disconnect", function() {
				delete connections[clientId];
				self.emit(SocketIoAbstraction.CLIENT_DISCONNECT, { clientId });
			});
			self.emit(SocketIoAbstraction.CLIENT_CONNECT, { clientId });
		});
    }

	function listenForClientEvents(self, ioServer) {
		ioServer.on("connect", (socket) => {
			SUPPORTED_EVENTS.forEach(function(eventConstructor) {
				socket.on(eventConstructor.EVENT_NAME, function(payload) {
					let args = {
						clientId: socket.id,
						receivedEvent: eventConstructor.fromPayload(payload)
					};
					self.emit(SocketIoAbstraction.CLIENT_EVENT_RECEIVED, args);
				});
			});
		});
	}

	function lookUpSocket(self, clientId) {
		const socket = self._socketIoConnections[clientId];
		failFast.unlessTrue(socket !== undefined, `attempted to look up socket that isn't connected: [${clientId}]`);
		return socket;
	}

	function failFastIfHttpServerClosed() {
		throw new Error(
			"Do not call httpServer.stop() when using RealTimeServer--it will trigger this bug: " +
			"https://github.com/socketio/socket.io/issues/2975"
		);
	}

}());