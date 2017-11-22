// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const io = require("socket.io");
	const failFast = require("fail_fast.js");
	const util = require("util");

	const SocketIoAbstraction = module.exports = class SocketIoAbstraction {

		start(httpServer) {
			failFast.unlessDefined(httpServer, "httpServer");

			this._httpServer = httpServer;
			this._ioServer = io(this._httpServer);

			this._httpServer.on("close", failFastIfHttpServerClosed);
		}

		stop() {
			const close = util.promisify(this._ioServer.close.bind(this._ioServer));

			this._httpServer.removeListener("close", failFastIfHttpServerClosed);
			return close();
		}

	};

	function failFastIfHttpServerClosed() {
		throw new Error(
			"Do not call httpServer.stop() when using RealTimeServer--it will trigger this bug: " +
			"https://github.com/socketio/socket.io/issues/2975"
		);
	}


}());