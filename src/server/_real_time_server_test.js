// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const RealTimeServer = require("./real_time_server.js");
	const HttpServer = require("./http_server.js");
	const assert = require("_assert");
	const ServerPointerEvent = require("../shared/server_pointer_event.js");
	const ClientPointerEvent = require("../shared/client_pointer_event.js");
	const ServerRemovePointerEvent = require("../shared/server_remove_pointer_event.js");
	const ClientRemovePointerEvent = require("../shared/client_remove_pointer_event.js");
	const ServerDrawEvent = require("../shared/server_draw_event.js");
	const ClientDrawEvent = require("../shared/client_draw_event.js");
	const ServerClearScreenEvent = require("../shared/server_clear_screen_event.js");
	const ClientClearScreenEvent = require("../shared/client_clear_screen_event.js");
	const SocketIoClient = require("./__socket_io_client.js");
	const Clock = require("./clock.js");

	const IRRELEVANT_DIR = "generated/test";
	const IRRELEVANT_PAGE = "irrelevant.html";
	const IRRELEVANT_X = 42;
	const IRRELEVANT_Y = 42;

	const PORT = 5020;

	describe.only("RealTimeServer", function() {

		let httpServer;
		let realTimeServer;
		let socketIoClient;
		let fakeClock;

		beforeEach(async function() {
			fakeClock = Clock.createFake();
			httpServer = new HttpServer(IRRELEVANT_DIR, IRRELEVANT_PAGE);
			realTimeServer = new RealTimeServer(fakeClock);
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

		it("counts the number of connections", async function() {
			assert.equal(realTimeServer.numberOfActiveConnections(), 0, "before opening connection");

			const socket = await socketIoClient.createSocket();
			assert.equal(realTimeServer.numberOfActiveConnections(), 1, "after opening connection");

			await socketIoClient.closeSocket(socket);
		});

		it("tells us if a socket is connected", async function() {
			assert.equal(realTimeServer.isSocketConnected("no_such_socket"), false);

			const socket = await socketIoClient.createSocket();
			assert.equal(realTimeServer.isSocketConnected(socket.id), true);

			await socketIoClient.closeSocket(socket);
		});

		it("emits an event when a Socket.IO client event is received", async function() {
			const socket = await socketIoClient.createSocket();
			const sentEvent = new ClientRemovePointerEvent();

			const serverPromise = new Promise((resolve, reject) => {
				realTimeServer.onNextClientEvent((socketId, receivedEvent) => {
					try {
						assert.equal(socketId, socket.id, "socket ID");
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

		it("emits an event when the server has emitted a Socket.IO event", async function() {
			const emitter = await socketIoClient.createSocket();

			const clientEvent = new ClientPointerEvent(10, 20);
			const emitPromise = new Promise((resolve, reject) => {
				realTimeServer.onNextServerEmit((event) => {
					try {
						const serverEvent = clientEvent.toServerEvent(emitter.id);
						assert.deepEqual(event, serverEvent, "event");
						resolve();
					}
					catch (err) {
						reject(err);
					}
				});
			});

			emitter.emit(clientEvent.name(), clientEvent.payload());

			await emitPromise;
			await socketIoClient.closeSocket(emitter);
		});

		it("broadcasts pointer events from one client to all others", async function() {
			await checkEventReflection(new ClientPointerEvent(100, 200), ServerPointerEvent);
		});

		it("broadcasts 'remove pointer' events from one client to all others", async function() {
			await checkEventReflection(new ClientRemovePointerEvent(), ServerRemovePointerEvent);
		});

		it("broadcasts draw events from one client to all others", async function() {
			await checkEventReflection(new ClientDrawEvent(100, 200, 300, 400), ServerDrawEvent);
		});

		it("broadcasts clear screen events from one client to all others", async function() {
			await checkEventReflection(new ClientClearScreenEvent(), ServerClearScreenEvent);
		});

		it("treats events received via method call exactly like events received via Socket.IO", async function() {
			const clientEvent = new ClientPointerEvent(100, 200);
			const [receiver1, receiver2] = await socketIoClient.createSockets(2);
			const listeners = Promise.all([ receiver1, receiver2 ].map((client) => {
				return listenForOneEvent(client, ServerPointerEvent.EVENT_NAME, (data) => {
					assert.deepEqual(data, clientEvent.toServerEvent("__SIMULATED__").payload());
				});
			}));

			realTimeServer.simulateClientEvent(clientEvent);

			await listeners;
			await socketIoClient.closeSockets(receiver1, receiver2);
		});

		it("emits events for simulated client events", function(done) {
			const clientEvent = new ClientRemovePointerEvent();

			realTimeServer.onNextClientEvent((socketId, receivedEvent) => {
				assert.equal(socketId, "__SIMULATED__", "socket ID");
				assert.deepEqual(clientEvent, receivedEvent, "event");
				done();
			});
			realTimeServer.simulateClientEvent(clientEvent);
		});

		it("replays all previous events when client connects", async function() {
			const IRRELEVANT_ID = "irrelevant";

			const event1 = new ClientDrawEvent(1, 10, 100, 1000);
			const event2 = new ClientDrawEvent(2, 20, 200, 2000);
			const event3 = new ClientDrawEvent(3, 30, 300, 3000);

			realTimeServer.simulateClientEvent(event1, IRRELEVANT_ID);
			realTimeServer.simulateClientEvent(event2, IRRELEVANT_ID);
			realTimeServer.simulateClientEvent(event3, IRRELEVANT_ID);

			let replayedEvents = [];
			const client = socketIoClient.createSocketWithoutWaiting();
			await new Promise((resolve, reject) => {
				client.on(ServerDrawEvent.EVENT_NAME, function(event) {
					replayedEvents.push(ServerDrawEvent.fromPayload(event));
					if (replayedEvents.length === 3) {
						try {
							// if we don't get the events, the test will time out
							assert.deepEqual(replayedEvents, [
								event1.toServerEvent(),
								event2.toServerEvent(),
								event3.toServerEvent()
							]);
							resolve();
						}
						catch(e) {
							reject(e);
						}
					}
				});
			});
			await socketIoClient.closeSocket(client);
		});

		it("sends 'remove pointer' event to other browsers when client disconnects", async function() {
			const [ disconnector, client ] = await socketIoClient.createSockets(2);
			const disconnectorId = disconnector.id;

			const listenerPromise = listenForOneEvent(client, ServerRemovePointerEvent.EVENT_NAME, (eventData) => {
				const event = ServerRemovePointerEvent.fromPayload(eventData);
				assert.equal(event.id, disconnectorId);
			});

			await socketIoClient.closeSocket(disconnector);
			await listenerPromise;  // if disconnect event doesn't fire, the test will time out

			await socketIoClient.closeSocket(client);
		});

		it("stores 'remove pointer' event in event repo when client disconnects", async function() {
			const client = await socketIoClient.createSocket();
			const clientId = client.id;

			await socketIoClient.closeSocket(client);
			assert.deepEqual(
				realTimeServer._eventRepo.replay(),
				[ new ServerRemovePointerEvent(clientId) ]
			);
		});

		it("times out (removes) ghost pointer when no activity from the client for a period of time", async function() {
			const client = await socketIoClient.createSocket();

			const listenerPromise = listenForOneEvent(client, ServerRemovePointerEvent.EVENT_NAME, (eventData) => {
				const event = ServerRemovePointerEvent.fromPayload(eventData);
				assert.equal(event.id, client.id);
			});

			fakeClock.tick(RealTimeServer.CLIENT_TIMEOUT);
			await listenerPromise;

			await socketIoClient.closeSocket(client);
		});

		it("times out again if there was activity, and then no activity, after the first timeout", async function() {
			const client = await socketIoClient.createSocket();

			// first timeout
			const firstTimeout = listenForOneEvent(client, ServerRemovePointerEvent.EVENT_NAME);
			fakeClock.tick(RealTimeServer.CLIENT_TIMEOUT);
			await firstTimeout;

			// some more activity
			const clientEvent = new ClientClearScreenEvent();
			client.emit(clientEvent.name(), clientEvent.payload());
			await new Promise((resolve) => realTimeServer.onNextClientEvent(resolve));

			// second timeout
			const secondTimeout = listenForOneEvent(client, ServerRemovePointerEvent.EVENT_NAME);
			fakeClock.tick(RealTimeServer.CLIENT_TIMEOUT);
			await secondTimeout;

			// done
			await socketIoClient.closeSocket(client);
		});

		it("only sends remove pointer event one time when client times out", async function() {
			// setup
			const client = await socketIoClient.createSocket();

			// listen for first (valid) RemovePointerEvent
			const eventListener = listenForOneEvent(client, ServerRemovePointerEvent.EVENT_NAME);
			fakeClock.tick(RealTimeServer.CLIENT_TIMEOUT);
			await eventListener;

			// listen for second (invalid) RemovePointerEvent
			let errorOnEvent;
			realTimeServer.onNextServerEmit((event) => {
				if (errorOnEvent) assert.fail("should not receive remove pointer event");
			});

			// allow time to pass, which could trigger additional RemovePointerEvents
			errorOnEvent = true;
			fakeClock.tick(RealTimeServer.CLIENT_TIMEOUT);

			// done
			errorOnEvent = false;   // closing the socket will cause RemovePointerEvent, so we stop listening for errors
			await socketIoClient.closeSocket(client);
		});

		it("doesn't time out ghost pointer when the pointer has moved recently", async function() {
			const client = await socketIoClient.createSocket();

			client.on(ServerRemovePointerEvent.EVENT_NAME, (eventData) => {
				throw new Error("Should not have received 'remove pointer' event");
			});

			fakeClock.tick(RealTimeServer.CLIENT_TIMEOUT / 2);
			const event = new ClientPointerEvent(IRRELEVANT_X, IRRELEVANT_Y);

			const promise = new Promise((resolve) => {
				realTimeServer.onNextClientEvent((socketId, event) => {
					setTimeout(() => {  // make this code asynchronous so tick() doesn't happen too soon
						fakeClock.tick(RealTimeServer.CLIENT_TIMEOUT / 2);
						setTimeout(() => {// allow tick() to be processed so server event is sent if it's going to be (it shouldn't)
							resolve();
						}, 0);
					}, 0);
				});
			});
			client.emit(event.name(), event.payload());

			try {
				await promise;
			}
			finally {
				await socketIoClient.closeSocket(client);
			}
		});

		it("doesn't time out ghost pointer when any activity has been received from client", async function() {
			const client = await socketIoClient.createSocket();

			client.on(ServerRemovePointerEvent.EVENT_NAME, (eventData) => {
				throw new Error("Should not have received 'remove pointer' event");
			});

			fakeClock.tick(RealTimeServer.CLIENT_TIMEOUT / 2);
			const event = new ClientClearScreenEvent();

			const promise = new Promise((resolve) => {
				realTimeServer.onNextClientEvent((socketId, event) => {
					setTimeout(() => {  // make this code asynchronous so tick() doesn't happen too soon
						fakeClock.tick(RealTimeServer.CLIENT_TIMEOUT / 2);
						setTimeout(() => {// allow tick() to be processed so server event is sent if it's going to be (it shouldn't)
							resolve();
						}, 0);
					}, 0);
				});
			});
			client.emit(event.name(), event.payload());

			try {
				await promise;
			}
			finally {
				await socketIoClient.closeSocket(client);
			}
		});

		it("doesn't time out clients that have disconnected", async function() {
			const client = await socketIoClient.createSocket();
			await socketIoClient.closeSocket(client);

			realTimeServer.onNextServerEmit((event) => {
				assert.fail("should not receive remove pointer event");
			});
			fakeClock.tick(RealTimeServer.CLIENT_TIMEOUT);
		});

		function listenForOneEvent(socket, eventName, fn) {
			return new Promise((resolve, reject) => {
				socket.once(eventName, function(eventData) {
					try {
						if (fn) fn(eventData);
						resolve();
					}
					catch(err) {
						reject(err);
					}
				});
			});
		}

		async function checkEventReflection(clientEvent, serverEventConstructor) {
			const [emitter, receiver1, receiver2] = await socketIoClient.createSockets(3);
			emitter.on(serverEventConstructor.EVENT_NAME, function() {
				assert.fail("emitter should not receive its own events");
			});

			const listenerPromise = Promise.all([ receiver1, receiver2 ].map((client) => {
				return listenForOneEvent(client, serverEventConstructor.EVENT_NAME, (data) => {
					assert.deepEqual(data, clientEvent.toServerEvent(emitter.id).payload());
				});
			}));

			emitter.emit(clientEvent.name(), clientEvent.payload());

			await listenerPromise;
			await socketIoClient.closeSockets(emitter, receiver1, receiver2);
		}

	});

}());