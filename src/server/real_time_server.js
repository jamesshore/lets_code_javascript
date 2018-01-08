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
			listenForClientEvents(this, this._ioServer);
		}

		stop() {
			const close = util.promisify(this._ioServer.close.bind(this._ioServer));

			this._nodeHttpServer.removeListener("close", failFastIfHttpServerClosed);
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

		triggerClientDisconnectEvent(clientId) {
			this.emit(RealTimeServer.CLIENT_DISCONNECT, clientId);
		}

	};

	RealTimeServer.createNull = function() {
		const server = new RealTimeServer(new NullHttpServer());
		server._io = nullIo;
		return server;
	};

	RealTimeServer.CLIENT_DISCONNECT = "clientDisconnect";
	RealTimeServer.CLIENT_CONNECT = "clientConnect";
	RealTimeServer.CLIENT_EVENT_RECEIVED = "clientEvent";


	function trackSocketIoConnections(self, connections, ioServer) {
		// Inspired by isaacs
		// https://github.com/isaacs/server-destroy/commit/71f1a988e1b05c395e879b18b850713d1774fa92
		ioServer.on("connection", function(socket) {
			const key = socket.id;
			connections[key] = socket;
			socket.on("disconnect", function() {
				delete connections[key];
				self.triggerClientDisconnectEvent(key);
			});
			self.emit(RealTimeServer.CLIENT_CONNECT, key, socket);
		});
	}

	function listenForClientEvents(self, ioServer) {
		ioServer.on("connect", (socket) => {
			SUPPORTED_EVENTS.forEach(function(eventConstructor) {
				socket.on(eventConstructor.EVENT_NAME, function(payload) {
					self.emit(RealTimeServer.CLIENT_EVENT_RECEIVED, socket.id, eventConstructor.fromPayload(payload));
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

	function nullIo() {
		return new NullIoServer();
	}

	function noOp() {}

}());