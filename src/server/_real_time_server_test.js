// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const assert = require("_assert");
	const SocketIoClient = require("./__socket_io_client.js");
	const HttpServer = require("./http_server.js");
	const RealTimeServer = require("./real_time_server.js");
	const ClientRemovePointerEvent = require("../shared/client_remove_pointer_event.js");

	describe("RealTimeServer", function() {

		const IRRELEVANT_DIR = "generated/test";
		const IRRELEVANT_PAGE = "irrelevant.html";
		const PORT = 5020;

		let httpServer;
		let realTimeServer;
		let socketIoClient;

		beforeEach(async function() {
			httpServer = new HttpServer(IRRELEVANT_DIR, IRRELEVANT_PAGE);
			realTimeServer = new RealTimeServer();
			socketIoClient = new SocketIoClient("http://localhost:" + PORT, realTimeServer);

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

		it("emits event when a client connects", async function() {
			let socket;

			const eventPromise = new Promise((resolve, reject) => {
				realTimeServer.once(RealTimeServer.CLIENT_CONNECT, (clientId) => {
					resolve(clientId);
				});
			});

			socket = await socketIoClient.createSocket();
			const clientId = await eventPromise;
			assert.equal(clientId, socket.id, "client ID");

			await socketIoClient.closeSocket(socket);
		});

		it("emits event when a client disconnects", async function() {
			const socket = await socketIoClient.createSocket();
			const socketId = socket.id;

			const eventPromise = new Promise((resolve, reject) => {
				realTimeServer.once(RealTimeServer.CLIENT_DISCONNECT, (clientId) => {
					resolve(clientId);
				});
			});

			await socketIoClient.closeSocket(socket);
			const clientId = await eventPromise;
			assert.equal(clientId, socketId, "client ID");
		});

		it("emits event when a Socket.IO event is received from client", async function() {
			const socket = await socketIoClient.createSocket();
			const eventToSend = new ClientRemovePointerEvent();

			const eventPromise = new Promise((resolve, reject) => {
				realTimeServer.once(RealTimeServer.CLIENT_EVENT_RECEIVED, (clientId, receivedEvent) => {
					resolve({ clientId, receivedEvent });
				});
			});

			socket.emit(eventToSend.name(), eventToSend.payload());
			const { clientId, receivedEvent } = await eventPromise;
			assert.equal(clientId, socket.id, "client ID");
			assert.deepEqual(receivedEvent, eventToSend, "event");

			await socketIoClient.closeSocket(socket);
		});

		it("sends event to specific Socket.IO client", async function() {
			const [ socket1, socket2 ] = await socketIoClient.createSockets(2);
			const eventToSend = new ClientRemovePointerEvent();

			const socketPromise = listenForOneClientSocketEvent(socket1, eventToSend);
			socket2.once(eventToSend.name(), () => {
				assert.fail("Event should not have been sent to both clients");
			});

			realTimeServer.sendToOneClient(socket1.id, eventToSend);
			const receivedPayload = await socketPromise;
			assert.deepEqual(receivedPayload, eventToSend.payload());

			await socketIoClient.closeSockets(socket1, socket2);
		});

		it("sends events to all Socket.IO clients", async function() {
			const [ socket1, socket2 ] = await socketIoClient.createSockets(2);
			const eventToSend = new ClientRemovePointerEvent();

			const socket1Promise = listenForOneClientSocketEvent(socket1, eventToSend);
			const socket2Promise = listenForOneClientSocketEvent(socket2, eventToSend);

			realTimeServer.broadcastToAllClients(eventToSend);
			const received1 = await socket1Promise;
			const received2 = await socket2Promise;
			assert.deepEqual(received1, eventToSend.payload());
			assert.deepEqual(received2, eventToSend.payload());

			await socketIoClient.closeSockets(socket1, socket2);
		});

		it("sends event to all Socket.IO clients except one", async function() {
			const [ socket1, socket2, socket3 ] = await socketIoClient.createSockets(3);
			const eventToSend = new ClientRemovePointerEvent();

			const socket1Promise = listenForOneClientSocketEvent(socket1, eventToSend);
			const socket3Promise = listenForOneClientSocketEvent(socket3, eventToSend);
			socket2.once(eventToSend.name(), () => {
				assert.fail("Event should not have been sent to socket2");
			});

			realTimeServer.broadcastToAllClientsButOne(socket2.id, eventToSend);
			const received1 = await socket1Promise;
			const received3 = await socket3Promise;
			assert.deepEqual(received1, eventToSend.payload());
			assert.deepEqual(received3, eventToSend.payload());

			await socketIoClient.closeSockets(socket1, socket2, socket3);
		});

		it("tells us if a socket is connected", async function() {
			assert.equal(realTimeServer.isClientConnected("no_such_socket"), false);

			const socket = await socketIoClient.createSocket();
			assert.equal(realTimeServer.isClientConnected(socket.id), true);

			await socketIoClient.closeSocket(socket);
		});

		it("counts the number of connections", async function() {
			assert.equal(realTimeServer.numberOfActiveConnections(), 0, "before opening connection");

			const socket = await socketIoClient.createSocket();
			assert.equal(realTimeServer.numberOfActiveConnections(), 1, "after opening connection");

			await socketIoClient.closeSocket(socket);
		});

		function listenForOneClientSocketEvent(socket, event) {
			return new Promise((resolve, reject) => {
				socket.once(event.name(), (eventPayload) => {
					resolve(eventPayload);
				});
			});
		}

	});

}());