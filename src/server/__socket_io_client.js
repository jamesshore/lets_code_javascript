// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const io = require("socket.io-client");

	module.exports = class SocketIoClient {

		constructor(serverUrl) {
			this._serverUrl = serverUrl;
		}

		async createSockets(numSockets) {
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
		}

		async closeSockets(...sockets) {
			await Promise.all(sockets.map(async (socket) => {
				await this.closeSocket(socket);
			}));
		}

		createSocket() {
			var socket = io(this._serverUrl);
			return new Promise(function(resolve) {
				socket.on("connect", function() {
					return resolve(socket);
				});
			});
		}

		closeSocket(socket) {
			var closePromise = new Promise(function(resolve) {
				socket.on("disconnect", function() {
					return resolve();
				});
			});
			socket.disconnect();

			return closePromise;
		}
	};

}());