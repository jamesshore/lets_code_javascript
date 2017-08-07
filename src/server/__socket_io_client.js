// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const io = require("socket.io-client");

	module.exports = class SocketIoClient {

		constructor(serverUrl, realTimeServer) {
			this._serverUrl = serverUrl;
			this._realTimeServer = realTimeServer;
		}

		createSockets(numSockets) {
			// Need to create our sockets in serial, not parallel, because the tests won't exit if we don't.
			// I believe it's a bug in Socket.IO but I haven't been able to reproduce with a
			// trimmed-down test case. If you want to try converting this back to a parallel
			// implementation, be sure to run the tests about ten times because the issue doesn't
			// always occur. -JDLS 4 Aug 2017

			let sockets = [];
			for (let i = 0; i < numSockets; i++) {
				sockets.push(this.createSocket());
			}
			return Promise.all(sockets);
		}

		async closeSockets(...sockets) {
			await Promise.all(sockets.map(async (socket) => {
				await this.closeSocket(socket);
			}));
		}

		createSocket() {
			const socket = this.createSocketWithoutWaiting();
			return new Promise((resolve, reject) => {
				socket.on("connect", () => {
					waitForServerToConnect(socket.id, this._realTimeServer)
						.then(() => resolve(socket))
						.catch(reject);
				});
			});
		}

		createSocketWithoutWaiting() {
			return io(this._serverUrl);
		}

		closeSocket(socket) {
			return new Promise((resolve, reject) => {
				socket.on("disconnect", () => {
					waitForServerToDisconnect(socket.id, this._realTimeServer)
						.then(() => resolve(socket))
						.catch(reject);
				});
				socket.disconnect();
			});
		}
	};

	function waitForServerToConnect(socketId, realTimeServer) {
		return waitForServerSocketState(true, socketId, realTimeServer);
	}

	function waitForServerToDisconnect(socketId, realTimeServer) {
		return waitForServerSocketState(false, socketId, realTimeServer);
	}

	async function waitForServerSocketState(expectedConnectionState, socketId, realTimeServer) {
		const TIMEOUT = 1000; // milliseconds
		const RETRY_PERIOD = 10; // milliseconds

		const startTime = Date.now();
		let success = !expectedConnectionState;

		while(success !== expectedConnectionState && !isTimeUp()) {
			await timeoutPromise(RETRY_PERIOD);
			success = realTimeServer.isSocketConnected(socketId);
		}
		if (isTimeUp()) throw new Error("socket " + socketId + " failed to connect to server");

		function isTimeUp() {
			return (startTime + TIMEOUT) < Date.now();
		}

		function timeoutPromise(milliseconds) {
			return new Promise((resolve) => {
				setTimeout(resolve, milliseconds);
			});
		}
	}

}());