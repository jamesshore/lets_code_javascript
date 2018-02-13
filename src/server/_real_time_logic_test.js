// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const RealTimeLogic = require("./real_time_logic.js");
	const RealTimeServer = require("./real_time_server.js");
	const HttpServer = require("./http_server.js");
	const assert = require("_assert");
	const ClientPointerEvent = require("../shared/client_pointer_event.js");
	const ServerRemovePointerEvent = require("../shared/server_remove_pointer_event.js");
	const ClientDrawEvent = require("../shared/client_draw_event.js");
	const SocketIoClient = require("./__socket_io_client.js");
	const Clock = require("./clock.js");

	const IRRELEVANT_DIR = "generated/test";
	const IRRELEVANT_PAGE = "irrelevant.html";
	const IRRELEVANT_MESSAGE = new ClientPointerEvent(42, 24);

	const PORT = 5020;

	describe("RealTimeLogic", function() {

		let httpServer;
		let realTimeLogic;
		let nullRealTimeServer;
		let networkedRealTimeLogic;
		let networkedRealTimeServer;
		let socketIoClient;
		let fakeClock;

		beforeEach(async function() {
			fakeClock = Clock.createFake();
			httpServer = new HttpServer(IRRELEVANT_DIR, IRRELEVANT_PAGE);

			networkedRealTimeServer = new RealTimeServer(httpServer);
			networkedRealTimeServer.start();

			networkedRealTimeLogic = new RealTimeLogic(networkedRealTimeServer, fakeClock);
			networkedRealTimeLogic.start();

			socketIoClient = new SocketIoClient("http://localhost:" + PORT, networkedRealTimeServer);
			await httpServer.start(PORT);


			nullRealTimeServer = RealTimeServer.createNull();
			nullRealTimeServer.start();
			realTimeLogic = new RealTimeLogic(nullRealTimeServer, fakeClock);
			realTimeLogic.start();
		});

		afterEach(async function() {
			try {
				assert.equal(
					networkedRealTimeLogic.numberOfActiveConnections(), 0,
					"afterEach() requires all sockets to be closed"
				);
			}
			finally {
				networkedRealTimeLogic.stop();
				await networkedRealTimeServer.stop();

				realTimeLogic.stop();
				await nullRealTimeServer.stop();
			}
		});

		it("broadcasts messages from one client to all others", function() {
			const clientId = "client id";
			const clientMessage = new ClientPointerEvent(100, 200);

			nullRealTimeServer.connectNullClient(clientId);
			nullRealTimeServer.triggerClientMessageEvent(clientId, clientMessage);
			assert.deepEqual(nullRealTimeServer.getLastSentMessage(), {
				message: clientMessage.toServerEvent(clientId),
				clientId,
				type: RealTimeServer.SEND_TYPE.ALL_CLIENTS_BUT_ONE
			});
		});

		it("replays all previous messages when client connects", function() {
			const IRRELEVANT_ID = "irrelevant";

			const message1 = new ClientDrawEvent(1, 10, 100, 1000);
			const message2 = new ClientDrawEvent(2, 20, 200, 2000);
			const message3 = new ClientDrawEvent(3, 30, 300, 3000);

			nullRealTimeServer.connectNullClient(IRRELEVANT_ID);
			nullRealTimeServer.triggerClientMessageEvent(IRRELEVANT_ID, message1);
			nullRealTimeServer.triggerClientMessageEvent(IRRELEVANT_ID, message2);
			nullRealTimeServer.triggerClientMessageEvent(IRRELEVANT_ID, message3);

			const serverMessages = [];
			nullRealTimeServer.on(RealTimeServer.SERVER_MESSAGE, (message) => {
				serverMessages.push(message);
			});

			const connectingClient = "connecting client";
			nullRealTimeServer.connectNullClient(connectingClient);

			assert.deepEqual(serverMessages, [
				{ message: message1.toServerEvent(), clientId: connectingClient, type: RealTimeServer.SEND_TYPE.ONE_CLIENT },
				{ message: message2.toServerEvent(), clientId: connectingClient, type: RealTimeServer.SEND_TYPE.ONE_CLIENT },
				{ message: message3.toServerEvent(), clientId: connectingClient, type: RealTimeServer.SEND_TYPE.ONE_CLIENT }
			]);
		});

		it("sends 'remove pointer' message to other browsers when client disconnects", function() {
			let clientId = "my client ID";
			nullRealTimeServer.triggerClientConnectEvent(clientId);
			nullRealTimeServer.triggerClientDisconnectEvent(clientId);

			assert.deepEqual(nullRealTimeServer.getLastSentMessage(), {
				message: new ServerRemovePointerEvent(clientId),
				type: RealTimeServer.SEND_TYPE.ALL_CLIENTS
			});
		});

		it("when sending 'remove pointer' message after timeout, uses the correct client ID", function() {
			let correctId = "correct client ID";
			nullRealTimeServer.triggerClientConnectEvent(correctId);
			nullRealTimeServer.triggerClientConnectEvent("different client ID");

			nullRealTimeServer.triggerClientDisconnectEvent(correctId);

			assert.deepEqual(nullRealTimeServer.getLastSentMessage(), {
				message: new ServerRemovePointerEvent(correctId),
				type: RealTimeServer.SEND_TYPE.ALL_CLIENTS
			});
		});

		it("stores 'remove pointer' event in event repo when client disconnects", function() {
			const clientId = "my client ID";

			nullRealTimeServer.triggerClientConnectEvent(clientId);
			nullRealTimeServer.triggerClientDisconnectEvent(clientId);
			assert.deepEqual(
				realTimeLogic._eventRepo.replay(),
				[ new ServerRemovePointerEvent(clientId) ]
			);
		});

		it("times out (removes) ghost pointer when no activity from the client for a period of time", function() {
			const clientId = "my client ID";
			nullRealTimeServer.triggerClientConnectEvent(clientId);

			fakeClock.tick(RealTimeLogic.CLIENT_TIMEOUT);
			assert.deepEqual(nullRealTimeServer.getLastSentMessage(), {
				message: new ServerRemovePointerEvent(clientId),
				type: RealTimeServer.SEND_TYPE.ALL_CLIENTS
			});
		});

		it("doesn't time out ghost pointer when any activity has been received from client", function() {
			const clientId = "my client ID";
			let removePointerEventsReceived = 0;
			nullRealTimeServer.on(RealTimeServer.SERVER_MESSAGE, ({ message }) => {
				if (message.name() === ServerRemovePointerEvent.EVENT_NAME) removePointerEventsReceived++;
			});

			nullRealTimeServer.connectNullClient(clientId);

			fakeClock.tick(RealTimeLogic.CLIENT_TIMEOUT / 2);
			nullRealTimeServer.triggerClientMessageEvent(clientId, IRRELEVANT_MESSAGE);
			fakeClock.tick(RealTimeLogic.CLIENT_TIMEOUT / 2);
			assert.equal(removePointerEventsReceived, 0, "should not get any timeout messages");
		});

		it("times out again if there was activity, and then no activity, after the first timeout", function() {
			const clientId = "my client ID";

			let removePointerEventsReceived = 0;
			nullRealTimeServer.on(RealTimeServer.SERVER_MESSAGE, ({ message }) => {
				if (message.name() === ServerRemovePointerEvent.EVENT_NAME) removePointerEventsReceived++;
			});

			nullRealTimeServer.connectNullClient(clientId);

			fakeClock.tick(RealTimeLogic.CLIENT_TIMEOUT);
			assert.equal(removePointerEventsReceived, 1, "should have timed out once");

			nullRealTimeServer.triggerClientMessageEvent(clientId, IRRELEVANT_MESSAGE);
			fakeClock.tick(RealTimeLogic.CLIENT_TIMEOUT);
			assert.equal(removePointerEventsReceived, 2, "should time out again after new activity");
		});

		it("only sends remove pointer event one time when client times out", function() {
			const clientId = "my client ID";

			let removePointerEventsReceived = 0;
			nullRealTimeServer.on(RealTimeServer.SERVER_MESSAGE, ({ message }) => {
				if (message.name() === ServerRemovePointerEvent.EVENT_NAME) removePointerEventsReceived++;
			});

			nullRealTimeServer.triggerClientConnectEvent(clientId);

			fakeClock.tick(RealTimeLogic.CLIENT_TIMEOUT * 10);
			assert.equal(removePointerEventsReceived, 1, "should only time out once");
		});

		it("doesn't time out clients that have disconnected", function() {
			const clientId = "my client ID";
			let removePointerEventsReceived = 0;
			nullRealTimeServer.on(RealTimeServer.SERVER_MESSAGE, ({ message }) => {
				if (message.name() === ServerRemovePointerEvent.EVENT_NAME) removePointerEventsReceived++;
			});

			nullRealTimeServer.triggerClientConnectEvent(clientId);
			nullRealTimeServer.triggerClientDisconnectEvent(clientId);
			assert.equal(removePointerEventsReceived, 1, "should get a disconnect event when disconnecting");

			fakeClock.tick(RealTimeLogic.CLIENT_TIMEOUT);
			assert.deepEqual(removePointerEventsReceived, 1, "should not get another disconnect due to timeout");
		});

	});

}());