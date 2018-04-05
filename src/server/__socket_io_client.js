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
				const id = socket.id;
				socket.on("disconnect", () => {
					waitForServerToDisconnect(id, this._realTimeServer)
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
		// We wait for sockets to be created or destroyed on the server because, when we don't,
		// we seem to trigger all kinds of Socket.IO nastiness. Sometimes Socket.IO won't close
		// a connection, and sometimes the tests just never exit. Waiting for the server seems
		// to prevent those problems, which apparently are caused by creating and destroying sockets
		// too quickly.

		const TIMEOUT = 1000; // milliseconds
		const RETRY_PERIOD = 10; // milliseconds

		const startTime = Date.now();
		let success = !expectedConnectionState;

		while(success !== expectedConnectionState && !isTimeUp()) {
			await timeoutPromise(RETRY_PERIOD);
			success = realTimeServer.isClientConnected(socketId);
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