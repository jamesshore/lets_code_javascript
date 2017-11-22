// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const io = require("socket.io");
	const failFast = require("fail_fast.js");
	const util = require("util");

	const SocketIoAbstraction = module.exports = class SocketIoAbstraction {

		constructor() {
			this._socketIoConnections = {};
		}

		start(httpServer) {
			failFast.unlessDefined(httpServer, "httpServer");

			this._httpServer = httpServer;
			this._ioServer = io(this._httpServer);
			this._httpServer.on("close", failFastIfHttpServerClosed);

			trackSocketIoConnections(this._socketIoConnections, this._ioServer);
		}

		stop() {
			const close = util.promisify(this._ioServer.close.bind(this._ioServer));

			this._httpServer.removeListener("close", failFastIfHttpServerClosed);
			return close();
		}

		broadcastToAllClients(event) {
			this._ioServer.emit(event.name(), event.payload());
		}

	};

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

	function failFastIfHttpServerClosed() {
		throw new Error(
			"Do not call httpServer.stop() when using RealTimeServer--it will trigger this bug: " +
			"https://github.com/socketio/socket.io/issues/2975"
		);
	}

}());