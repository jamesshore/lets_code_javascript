// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const io = require("socket.io-client");

	const TestClient = module.exports = function(serverUrl) {
		this._serverUrl = serverUrl;
	};

	TestClient.prototype.createSockets = async function(numSockets) {
		// Need to create our sockets in serial, not parallel, because the tests won't exit if we don't.
		// I believe it's a bug in Socket.IO but I haven't been able to reproduce with a
		// trimmed-down test case. If you want to try converting this back to a parallel
		// implementation, be sure to run the tests about ten times because the issue doesn't
		// always occur. -JDLS 4 Aug 2017

		let sockets = [];
		for (let i = 0; i < numSockets; i++) {
			sockets.push(await this.createSocket());
		}
		return sockets;
	};

	TestClient.prototype.closeSockets = async function(...sockets) {
		await Promise.all(sockets.map(async (socket) => {
			await this.closeSocket(socket);
		}));
	};

	TestClient.prototype.createSocket = function() {
		var socket = io(this._serverUrl);
		return new Promise(function(resolve) {
			socket.on("connect", function() {
				return resolve(socket);
			});
		});
	};

	TestClient.prototype.closeSocket = function(socket) {
		var closePromise = new Promise(function(resolve) {
			socket.on("disconnect", function() {
				return resolve();
			});
		});
		socket.disconnect();

		return closePromise;
	};

}());