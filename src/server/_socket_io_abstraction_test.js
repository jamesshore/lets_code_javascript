// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const assert = require("_assert");
	const SocketIoClient = require("./__socket_io_client.js");
	const HttpServer = require("./http_server.js");
	const SocketIoAbstraction = require("./socket_io_abstraction.js");
	const ClientRemovePointerEvent = require("../shared/client_remove_pointer_event.js");

	describe("Socket.IO Abstraction", function() {

		const IRRELEVANT_DIR = "generated/test";
		const IRRELEVANT_PAGE = "irrelevant.html";
		const PORT = 5020;

		let httpServer;
		let socketIoAbstraction;
		let socketIoClient;

		beforeEach(async function() {
			httpServer = new HttpServer(IRRELEVANT_DIR, IRRELEVANT_PAGE);
			socketIoAbstraction = new SocketIoAbstraction();
			socketIoClient = new SocketIoClient("http://localhost:" + PORT, socketIoAbstraction);

			socketIoAbstraction.start(httpServer.getNodeServer());
			await httpServer.start(PORT);
		});

		afterEach(async function() {
			try {
				assert.equal(
					socketIoAbstraction.numberOfActiveConnections(), 0,
					"afterEach() requires all sockets to be closed"
				);
			}
			finally {
				await socketIoAbstraction.stop();
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
				socketIoAbstraction.once("clientConnect", (clientId) => {
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
				socketIoAbstraction.once("clientDisconnect", (clientId) => {
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
				socketIoAbstraction.once("clientEvent", (clientId, receivedEvent) => {
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

			const socketPromise = new Promise((resolve, reject) => {
				socket1.once(eventToSend.name(), (eventPayload) => {
					resolve(eventPayload);
				});
			});
			socket2.once(eventToSend.name(), () => {
				assert.fail("Event should not have been sent to both clients");
			});

			socketIoAbstraction.emitToOneClient(socket1.id, eventToSend);
			const receivedPayload = await socketPromise;
			assert.deepEqual(receivedPayload, eventToSend.payload());

			await socketIoClient.closeSockets(socket1, socket2);
		});

		it("tells us if a socket is connected", async function() {
			assert.equal(socketIoAbstraction.isClientConnected("no_such_socket"), false);

			const socket = await socketIoClient.createSocket();
			assert.equal(socketIoAbstraction.isClientConnected(socket.id), true);

			await socketIoClient.closeSocket(socket);
		});

		it("counts the number of connections", async function() {
			assert.equal(socketIoAbstraction.numberOfActiveConnections(), 0, "before opening connection");

			const socket = await socketIoClient.createSocket();
			assert.equal(socketIoAbstraction.numberOfActiveConnections(), 1, "after opening connection");

			await socketIoClient.closeSocket(socket);
		});

	});

}());