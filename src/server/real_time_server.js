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

	const RealTimeServer = module.exports = class RealTimeServer extends EventEmitter {

		constructor(httpServer) {
			super();

			failFast.unlessDefined(httpServer, "httpServer");
			this._nodeHttpServer = httpServer.getNodeServer();

			this._socketIoConnections = {};
			this._io = io;
		}

		start() {
			this._ioServer = this._io(this._nodeHttpServer);
			this._nodeHttpServer.on("close", failFastIfHttpServerClosed);

			trackSocketIoConnections(this, this._socketIoConnections, this._ioServer);
			listenForClientMessages(this, this._ioServer);
		}

		stop() {
			const close = util.promisify(this._ioServer.close.bind(this._ioServer));

			this._nodeHttpServer.removeListener("close", failFastIfHttpServerClosed);
			return close();
		}

		sendToOneClient(clientId, message) {
			const socket = lookUpSocket(this, clientId);
			socket.emit(message.name(), message.payload());
			this._lastSentMessage = {
				message,
				clientId,
				type: RealTimeServer.SEND_TYPE.ONE_CLIENT
			};
		}

		broadcastToAllClients(message) {
			this._ioServer.emit(message.name(), message.payload());
			this._lastSentMessage = {
				message,
				type: RealTimeServer.SEND_TYPE.ALL_CLIENTS
			};
		}

		broadcastToAllClientsButOne(clientToExclude, message) {
			const socket = lookUpSocket(this, clientToExclude);
			socket.broadcast.emit(message.name(), message.payload());
			this._lastSentMessage = {
				message,
				clientId: clientToExclude,
				type: RealTimeServer.SEND_TYPE.ALL_CLIENTS_BUT_ONE
			};
		}

		getLastSentMessage() {
			return this._lastSentMessage;
		}

		isClientConnected(clientId) {
			return this._socketIoConnections[clientId] !== undefined;
		}

		numberOfActiveConnections() {
			return Object.keys(this._socketIoConnections).length;
		}

		triggerClientConnectEvent(clientId) {
			this.emit(RealTimeServer.CLIENT_CONNECT, clientId);
		}

		triggerClientDisconnectEvent(clientId) {
			this.emit(RealTimeServer.CLIENT_DISCONNECT, clientId);
		}

		triggerClientMessageEvent(clientId, message) {
			this.emit(RealTimeServer.CLIENT_MESSAGE, clientId, message);
		}

		connectNullClient(clientId) {
			connectClient(this, new NullSocket(clientId));
		}

		disconnectNullClient(clientId) {
			const socket = lookUpSocket(this, clientId);
			failFast.unlessTrue(socket.isNull === true, `Attempted to disconnect non-null client: [${clientId}]`);
			disconnectClient(this, socket);
		}
	};

	RealTimeServer.createNull = function() {
		const server = new RealTimeServer(new NullHttpServer());
		server._io = nullIo;
		return server;
	};

	RealTimeServer.CLIENT_DISCONNECT = "clientDisconnect";
	RealTimeServer.CLIENT_CONNECT = "clientConnect";
	RealTimeServer.CLIENT_MESSAGE = "clientEvent";

	RealTimeServer.SEND_TYPE = {
		ONE_CLIENT: "one_client",
		ALL_CLIENTS: "all_clients",
		ALL_CLIENTS_BUT_ONE: "all_clients_but_one"
	};

	function trackSocketIoConnections(self, connections, ioServer) {
		// Inspired by isaacs
		// https://github.com/isaacs/server-destroy/commit/71f1a988e1b05c395e879b18b850713d1774fa92
		ioServer.on("connection", function(socket) {
			connectClient(self, socket);
			socket.on("disconnect", function() {
				disconnectClient(self, socket);
			});
		});
	}

	function listenForClientMessages(self, ioServer) {
		ioServer.on("connect", (socket) => {
			SUPPORTED_EVENTS.forEach(function(eventConstructor) {
				socket.on(eventConstructor.EVENT_NAME, function(payload) {
					self.triggerClientMessageEvent(socket.id, eventConstructor.fromPayload(payload));
				});
			});
		});
	}

	function connectClient(self, socket) {
		const key = socket.id;
		failFast.unlessDefined(key, "socket.id");

		self._socketIoConnections[key] = socket;
		self.triggerClientConnectEvent(key);
	}

	function disconnectClient(self, socket) {
		const key = socket.id;
		failFast.unlessDefined(key, "socket.id");

		delete self._socketIoConnections[key];
		self.triggerClientDisconnectEvent(key);
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


	class NullHttpServer {
		getNodeServer() {
			return {
				on: noOp,
				removeListener: noOp
			};
		}
	}

	class NullIoServer {
		on() {}
		emit() {}
		close(done) { return done(); }
	}

	class NullSocket {
		constructor(id) { this.id = id; }
		get isNull() { return true; }
		emit() {}
		get broadcast() { return { emit: noOp }; }
	}

	function nullIo() {
		return new NullIoServer();
	}

	function noOp() {}

}());