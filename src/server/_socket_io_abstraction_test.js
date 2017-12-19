// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const assert = require("assert");
	const SocketIoClient = require("./__socket_io_client.js");
	const HttpServer = require("./http_server.js");
	const RealTimeServer = require("./real_time_server.js");
	const ClientRemovePointerEvent = require("../shared/client_remove_pointer_event.js");
	const ClientPointerEvent = require("../shared/client_pointer_event.js");

	describe("Socket.IO Abstraction", function() {

		const IRRELEVANT_DIR = "generated/test";
		const IRRELEVANT_PAGE = "irrelevant.html";
		const PORT = 5020;

		let httpServer;
		let realTimeServer;
		let socketIoAbstraction;
		let socketIoClient;

		beforeEach(async function() {
			httpServer = new HttpServer(IRRELEVANT_DIR, IRRELEVANT_PAGE);
			realTimeServer = new RealTimeServer();
			socketIoAbstraction = realTimeServer._socketIoAbstraction;
			socketIoClient = new SocketIoClient("http://localhost:" + PORT, realTimeServer._socketIoAbstraction);

			realTimeServer.start(httpServer.getNodeServer());
			await httpServer.start(PORT);
		});

		afterEach(async function() {
			try {
				assert.equal(
					realTimeServer.numberOfActiveConnections(), 0,
					"afterEach() requires all sockets to be closed"
				);
			}
			finally {
				await realTimeServer.stop();
			}
		});

		it("shuts down cleanly despite Socket.IO bug", function(done) {
			// Socket.IO has an issue where calling close() on the HTTP server fails if it's done too
			// soon after closing a Socket.IO connection. See https://github.com/socketio/socket.io/issues/2975
			// Here we make sure that RealTimeServer uses the correct workaround and doesn't fail.
			const socket = socketIoClient.createSocketWithoutWaiting();
			socket.on("connect", async () => {
				await socketIoClient.closeSocket(socket);
				done();
			});
			// if the bug occurs, the afterEach() function will time out
		});

		it("counts the number of connections", async function() {
			assert.equal(socketIoAbstraction.numberOfActiveConnections(), 0, "before opening connection");

			const socket = await socketIoClient.createSocket();
			assert.equal(socketIoAbstraction.numberOfActiveConnections(), 1, "after opening connection");

			await socketIoClient.closeSocket(socket);
		});

		it("tells us if a socket is connected", async function() {
			assert.equal(socketIoAbstraction.isClientConnected("no_such_socket"), false);

			const socket = await socketIoClient.createSocket();
			assert.equal(socketIoAbstraction.isClientConnected(socket.id), true);

			await socketIoClient.closeSocket(socket);
		});

		it("emits 'clientEvent' event when a Socket.IO event is received from client", async function() {
			const socket = await socketIoClient.createSocket();
			const sentEvent = new ClientRemovePointerEvent();

			const serverPromise = new Promise((resolve, reject) => {
				socketIoAbstraction.on("clientEvent", (clientId, receivedEvent) => {
					try {
						assert.equal(clientId, socket.id, "client ID");
						assert.deepEqual(receivedEvent, sentEvent, "event");
						resolve();
					}
					catch (err) {
						reject(err);
					}
				});
			});
			socket.emit(sentEvent.name(), sentEvent.payload());

			await serverPromise;
			await socketIoClient.closeSocket(socket);
		});

	});

}());