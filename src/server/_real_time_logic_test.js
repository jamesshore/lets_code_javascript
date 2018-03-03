// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const RealTimeLogic = require("./real_time_logic.js");
	const RealTimeServer = require("./real_time_server.js");
	const assert = require("_assert");
	const ClientPointerMessage = require("../shared/client_pointer_message.js");
	const ServerRemovePointerMessage = require("../shared/server_remove_pointer_message.js");
	const ClientDrawMessage = require("../shared/client_draw_message.js");
	const Clock = require("./clock.js");

	const IRRELEVANT_MESSAGE = new ClientPointerMessage(42, 24);

	describe("RealTimeLogic", function() {

		let realTimeLogic;
		let realTimeServer;
		let fakeClock;

		beforeEach(function() {
			fakeClock = Clock.createFake();

			realTimeServer = RealTimeServer.createNull();
			realTimeServer.start();
			realTimeLogic = new RealTimeLogic(realTimeServer, fakeClock);
			realTimeLogic.start();
		});

		afterEach(async function() {
			realTimeLogic.stop();
			await realTimeServer.stop();
		});

		it("broadcasts messages from one client to all others", function() {
			const clientId = "client id";
			const clientMessage = new ClientPointerMessage(100, 200);

			realTimeServer.connectNullClient(clientId);
			realTimeServer.triggerClientMessageEvent(clientId, clientMessage);
			assert.deepEqual(realTimeServer.getLastSentMessage(), {
				message: clientMessage.toServerEvent(clientId),
				clientId,
				type: RealTimeServer.SEND_TYPE.ALL_CLIENTS_BUT_ONE
			});
		});

		it("replays all previous messages when client connects", function() {
			const IRRELEVANT_ID = "irrelevant";

			const message1 = new ClientDrawMessage(1, 10, 100, 1000);
			const message2 = new ClientDrawMessage(2, 20, 200, 2000);
			const message3 = new ClientDrawMessage(3, 30, 300, 3000);

			realTimeServer.connectNullClient(IRRELEVANT_ID);
			realTimeServer.triggerClientMessageEvent(IRRELEVANT_ID, message1);
			realTimeServer.triggerClientMessageEvent(IRRELEVANT_ID, message2);
			realTimeServer.triggerClientMessageEvent(IRRELEVANT_ID, message3);

			const serverMessages = [];
			realTimeServer.on(RealTimeServer.SERVER_MESSAGE, (message) => {
				serverMessages.push(message);
			});

			const connectingClient = "connecting client";
			realTimeServer.connectNullClient(connectingClient);

			assert.deepEqual(serverMessages, [
				{ message: message1.toServerEvent(), clientId: connectingClient, type: RealTimeServer.SEND_TYPE.ONE_CLIENT },
				{ message: message2.toServerEvent(), clientId: connectingClient, type: RealTimeServer.SEND_TYPE.ONE_CLIENT },
				{ message: message3.toServerEvent(), clientId: connectingClient, type: RealTimeServer.SEND_TYPE.ONE_CLIENT }
			]);
		});

		it("sends 'remove pointer' message to other browsers when client disconnects", function() {
			let clientId = "my client ID";
			realTimeServer.triggerClientConnectEvent(clientId);
			realTimeServer.triggerClientDisconnectEvent(clientId);

			assert.deepEqual(realTimeServer.getLastSentMessage(), {
				message: new ServerRemovePointerMessage(clientId),
				type: RealTimeServer.SEND_TYPE.ALL_CLIENTS
			});
		});

		it("when sending 'remove pointer' message after timeout, uses the correct client ID", function() {
			let correctId = "correct client ID";
			realTimeServer.triggerClientConnectEvent(correctId);
			realTimeServer.triggerClientConnectEvent("different client ID");

			realTimeServer.triggerClientDisconnectEvent(correctId);

			assert.deepEqual(realTimeServer.getLastSentMessage(), {
				message: new ServerRemovePointerMessage(correctId),
				type: RealTimeServer.SEND_TYPE.ALL_CLIENTS
			});
		});

		it("stores 'remove pointer' event in event repo when client disconnects", function() {
			const clientId = "my client ID";

			realTimeServer.triggerClientConnectEvent(clientId);
			realTimeServer.triggerClientDisconnectEvent(clientId);
			assert.deepEqual(
				realTimeLogic._eventRepo.replay(),
				[ new ServerRemovePointerMessage(clientId) ]
			);
		});

		it("times out (removes) ghost pointer when no activity from the client for a period of time", function() {
			const clientId = "my client ID";
			realTimeServer.triggerClientConnectEvent(clientId);

			fakeClock.tick(RealTimeLogic.CLIENT_TIMEOUT);
			assert.deepEqual(realTimeServer.getLastSentMessage(), {
				message: new ServerRemovePointerMessage(clientId),
				type: RealTimeServer.SEND_TYPE.ALL_CLIENTS
			});
		});

		it("doesn't time out ghost pointer when any activity has been received from client", function() {
			const clientId = "my client ID";
			const counter = countRemovePointerEvents();

			realTimeServer.connectNullClient(clientId);

			fakeClock.tick(RealTimeLogic.CLIENT_TIMEOUT / 2);
			realTimeServer.triggerClientMessageEvent(clientId, IRRELEVANT_MESSAGE);
			fakeClock.tick(RealTimeLogic.CLIENT_TIMEOUT / 2);
			assert.equal(counter.eventsReceived, 0, "should not get any timeout messages");
		});

		it("times out again if there was activity, and then no activity, after the first timeout", function() {
			const clientId = "my client ID";
			const counter = countRemovePointerEvents();

			realTimeServer.connectNullClient(clientId);

			fakeClock.tick(RealTimeLogic.CLIENT_TIMEOUT);
			assert.equal(counter.eventsReceived, 1, "should have timed out once");

			realTimeServer.triggerClientMessageEvent(clientId, IRRELEVANT_MESSAGE);
			fakeClock.tick(RealTimeLogic.CLIENT_TIMEOUT);
			assert.equal(counter.eventsReceived, 2, "should time out again after new activity");
		});

		it("only sends remove pointer event one time when client times out", function() {
			const clientId = "my client ID";
			const counter = countRemovePointerEvents();

			realTimeServer.triggerClientConnectEvent(clientId);

			fakeClock.tick(RealTimeLogic.CLIENT_TIMEOUT * 10);
			assert.equal(counter.eventsReceived, 1, "should only time out once");
		});

		it("doesn't time out clients that have disconnected", function() {
			const clientId = "my client ID";
			const counter = countRemovePointerEvents();

			realTimeServer.triggerClientConnectEvent(clientId);
			realTimeServer.triggerClientDisconnectEvent(clientId);
			assert.equal(counter.eventsReceived, 1, "should get a disconnect event when disconnecting");

			fakeClock.tick(RealTimeLogic.CLIENT_TIMEOUT);
			assert.deepEqual(counter.eventsReceived, 1, "should not get another disconnect due to timeout");
		});

		function countRemovePointerEvents() {
			const counter = {
				eventsReceived: 0
			};
			realTimeServer.on(RealTimeServer.SERVER_MESSAGE, ({ message }) => {
				if (message.name() === ServerRemovePointerMessage.EVENT_NAME) counter.eventsReceived++;
			});
			return counter;
		}

	});

}());