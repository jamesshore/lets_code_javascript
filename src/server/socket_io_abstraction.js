// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const io = require('socket.io');
	const failFast = require("fail_fast.js");

	const SocketIoAbstraction = module.exports = class SocketIoAbstraction {

		start(httpServer) {
			failFast.unlessDefined(httpServer, "httpServer");

			this._httpServer = httpServer;
			this._ioServer = io(this._httpServer);
		}

	};

}());