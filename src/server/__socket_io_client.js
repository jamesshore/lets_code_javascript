// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const io = require("socket.io-client");

	module.exports = class SocketIoClient {

		constructor(serverUrl, realTimeServer) {
			this._serverUrl = serverUrl;
			this._realTimeServer = realTimeServer;
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
			const socket = this.createSocketWithoutWaiting();
			return new Promise((resolve, reject) => {
				socket.on("connect", async () => {
					await waitForServerConnection(socket.id, this._realTimeServer);
					resolve(socket);
				});
			});
		}

		createSocketWithoutWaiting() {
			return io(this._serverUrl);
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

	async function waitForServerConnection(socketId, realTimeServer) {
		const TIMEOUT = 1000; // milliseconds
		const RETRY_PERIOD = 10; // milliseconds

		const startTime = Date.now();
		let success = false;

		while(!success && !isTimeUp(TIMEOUT)) {
			await timeoutPromise(RETRY_PERIOD);
			success = realTimeServer.isSocketConnected(socketId);
		}
		if (isTimeUp(TIMEOUT)) throw new Error("socket " + socketId + " failed to connect to server");

		function isTimeUp(timeout) {
			return (startTime + timeout) < Date.now();
		}

		function timeoutPromise(milliseconds) {
			return new Promise((resolve) => {
				setTimeout(resolve, milliseconds);
			});
		}
	}

}());