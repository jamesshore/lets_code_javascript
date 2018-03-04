// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const assert = require("_assert");
	const SocketIoClient = require("./__socket_io_client.js");
	const HttpServer = require("./http_server.js");
	const RealTimeServer = require("./real_time_server.js");
	const ClientRemovePointerMessage = require("../shared/client_remove_pointer_message.js");
	const ServerRemovePointerMessage = require("../shared/server_remove_pointer_message.js");

	describe("RealTimeServer", function() {

		const IRRELEVANT_DIR = "generated/test";
		const IRRELEVANT_PAGE = "irrelevant.html";
		const PORT = 5020;

		let httpServer;
		let realTimeServer;
		let socketIoClient;

		beforeEach(async function() {
			httpServer = new HttpServer(IRRELEVANT_DIR, IRRELEVANT_PAGE);
			realTimeServer = new RealTimeServer(httpServer);
			socketIoClient = new SocketIoClient("http://localhost:" + PORT, realTimeServer);

			realTimeServer.start();
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

		it("connects and disconnects null clients (clients that don't actually exist)", function() {
			const clientId = "null client ID";
			const message = new ClientRemovePointerMessage(clientId);
			realTimeServer.connectNullClient(clientId);

			assert.equal(realTimeServer.isClientConnected(clientId), true);
			realTimeServer.sendToOneClient(clientId, message);  // should not throw exception
			realTimeServer.broadcastToAllClientsButOne(clientId, message);  // should not throw exception

			realTimeServer.disconnectNullClient(clientId);
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

		it("emits event when a message is received from a client", async function() {
			const socket = await socketIoClient.createSocket();
			const messageToSend = new ClientRemovePointerMessage();

			const eventPromise = new Promise((resolve, reject) => {
				realTimeServer.once(RealTimeServer.CLIENT_MESSAGE, (clientId, receivedMessage) => {
					resolve({ clientId, receivedMessage });
				});
			});

			socket.emit(messageToSend.name(), messageToSend.payload());
			const { clientId, receivedMessage } = await eventPromise;
			assert.equal(clientId, socket.id, "client ID");
			assert.deepEqual(receivedMessage, messageToSend, "message");

			await socketIoClient.closeSocket(socket);
		});

		it("simulates a client message received event", async function() {
			const clientId = "my client ID";
			const message = new ClientRemovePointerMessage();

			const eventPromise = new Promise((resolve, reject) => {
				realTimeServer.once(RealTimeServer.CLIENT_MESSAGE, (clientId, message) => {
					resolve({ clientId, message });
				});
			});
			realTimeServer.simulateClientMessage(clientId, message);
			assert.deepEqual(await eventPromise, { clientId, message });
		});

		it("sends message to specific Socket.IO client", async function() {
			const [ socket1, socket2 ] = await socketIoClient.createSockets(2);
			const messageToSend = new ClientRemovePointerMessage();

			const socketPromise = listenForOneMessage(socket1, messageToSend);
			socket2.once(messageToSend.name(), () => {
				assert.fail("Message should not have been sent to both clients");
			});

			realTimeServer.sendToOneClient(socket1.id, messageToSend);
			const receivedPayload = await socketPromise;
			assert.deepEqual(receivedPayload, messageToSend.payload());

			await socketIoClient.closeSockets(socket1, socket2);
		});

		it("sends message to all Socket.IO clients", async function() {
			const [ socket1, socket2 ] = await socketIoClient.createSockets(2);
			const messageToSend = new ClientRemovePointerMessage();

			const socket1Promise = listenForOneMessage(socket1, messageToSend);
			const socket2Promise = listenForOneMessage(socket2, messageToSend);

			realTimeServer.broadcastToAllClients(messageToSend);
			const received1 = await socket1Promise;
			const received2 = await socket2Promise;
			assert.deepEqual(received1, messageToSend.payload());
			assert.deepEqual(received2, messageToSend.payload());

			await socketIoClient.closeSockets(socket1, socket2);
		});

		it("sends message to all Socket.IO clients except one", async function() {
			const [ socket1, socket2, socket3 ] = await socketIoClient.createSockets(3);
			const messageToSend = new ClientRemovePointerMessage();

			const socket1Promise = listenForOneMessage(socket1, messageToSend);
			const socket3Promise = listenForOneMessage(socket3, messageToSend);
			socket2.once(messageToSend.name(), () => {
				assert.fail("Message should not have been sent to socket2");
			});

			realTimeServer.broadcastToAllClientsButOne(socket2.id, messageToSend);
			const received1 = await socket1Promise;
			const received3 = await socket3Promise;
			assert.deepEqual(received1, messageToSend.payload());
			assert.deepEqual(received3, messageToSend.payload());

			await socketIoClient.closeSockets(socket1, socket2, socket3);
		});

		it("emits event when a message is sent to a client", async function() {
			const clientId = "a client";
			const message = new ServerRemovePointerMessage(clientId);
			realTimeServer.connectNullClient(clientId);

			let eventPromise = listenForOneServerMessageEvent();
			realTimeServer.sendToOneClient(clientId, message);
			assert.deepEqual(await eventPromise, {
				message,
				clientId,
				type: RealTimeServer.SEND_TYPE.ONE_CLIENT
			}, "one");

			eventPromise = listenForOneServerMessageEvent();
			realTimeServer.broadcastToAllClients(message);
			assert.deepEqual(await eventPromise, {
				message,
				type: RealTimeServer.SEND_TYPE.ALL_CLIENTS
			}, "all");

			eventPromise = listenForOneServerMessageEvent();
			realTimeServer.broadcastToAllClientsButOne(clientId, message);
			assert.deepEqual(await eventPromise, {
				message,
				clientId,
				type: RealTimeServer.SEND_TYPE.ALL_CLIENTS_BUT_ONE
			}, "all but one");

			realTimeServer.disconnectNullClient(clientId);

			function listenForOneServerMessageEvent(event) {
				return new Promise((resolve, reject) => {
					realTimeServer.once(RealTimeServer.SERVER_MESSAGE, (value) => {
						resolve(value);
					});
				});
			}
		});

		it("tracks the last message sent", async function() {
			const socket = await socketIoClient.createSocket();
			const message = new ServerRemovePointerMessage("server client ID");

			realTimeServer.sendToOneClient(socket.id, message);
			assert.deepEqual(realTimeServer.getLastSentMessage(), {
				message,
				clientId: socket.id,
				type: RealTimeServer.SEND_TYPE.ONE_CLIENT
			}, "one");

			realTimeServer.broadcastToAllClients(message);
			assert.deepEqual(realTimeServer.getLastSentMessage(), {
				message,
				type: RealTimeServer.SEND_TYPE.ALL_CLIENTS
			}, "all");

			realTimeServer.broadcastToAllClientsButOne(socket.id, message);
			assert.deepEqual(realTimeServer.getLastSentMessage(), {
				message,
				clientId: socket.id,
				type: RealTimeServer.SEND_TYPE.ALL_CLIENTS_BUT_ONE
			}, "all but one");

			await socketIoClient.closeSocket(socket);
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

		function listenForOneMessage(socket, message) {
			return new Promise((resolve, reject) => {
				socket.once(message.name(), (messagePayload) => {
					resolve(messagePayload);
				});
			});
		}

	});


	describe("Null RealTimeServer", function() {

		const IRRELEVANT_MESSAGE = new ClientRemovePointerMessage();

		let realTimeServer;

		beforeEach(function() {
			realTimeServer = RealTimeServer.createNull();
			realTimeServer.start();
		});

		afterEach(async function() {
			await realTimeServer.stop();
		});

		it("does nothing when asked to broadcast message to all clients", function() {
			realTimeServer.broadcastToAllClients(IRRELEVANT_MESSAGE);
		});

		// it("sends events to one Socket.IO client", async function() {
		// });
		//
		// it("sends event to all Socket.IO clients except one", async function() {
		// });

	});

}());