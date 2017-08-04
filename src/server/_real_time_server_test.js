// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var RealTimeServer = require("./real_time_server.js");
	var HttpServer = require("./http_server.js");
	var http = require("http");
	var fs = require("fs");
	var assert = require("_assert");
	var io = require("socket.io-client");
	var ServerPointerEvent = require("../shared/server_pointer_event.js");
	var ClientPointerEvent = require("../shared/client_pointer_event.js");
	var ServerRemovePointerEvent = require("../shared/server_remove_pointer_event.js");
	var ClientRemovePointerEvent = require("../shared/client_remove_pointer_event.js");
	var ServerDrawEvent = require("../shared/server_draw_event.js");
	var ClientDrawEvent = require("../shared/client_draw_event.js");
	var ServerClearScreenEvent = require("../shared/server_clear_screen_event.js");
	var ClientClearScreenEvent = require("../shared/client_clear_screen_event.js");

	var IRRELEVANT_DIR = "generated/test";
	var IRRELEVANT_PAGE = "irrelevant.html";

	var PORT = 5020;

	describe("RealTimeServer", function() {
		var httpServer;
		var realTimeServer;

		beforeEach(async function() {
			httpServer = new HttpServer(IRRELEVANT_DIR, IRRELEVANT_PAGE);
			realTimeServer = new RealTimeServer();

			realTimeServer.start(httpServer.getNodeServer());
			await httpServer.start(PORT);
		});

		afterEach(async function() {
			try {
				console.log("CHECKING THAT ALL SOCKETS ARE CLOSED");
				await waitForConnectionCount(0, "afterEach() requires all sockets to be closed");
			}
			finally {
				console.log("STOPPING SERVER");
				await realTimeServer.stop();
				console.log("SERVER STOPPED");
			}
		});

		it("shuts down cleanly despite Socket.IO bug", async function() {
			// Socket.IO has an issue where calling close() on the HTTP server fails if it's done too
			// soon after closing a Socket.IO connection. See https://github.com/socketio/socket.io/issues/2975
			// Here we make sure that we can shut down cleanly.
			const socket = await createSocket();
			// if the bug occurs, the afterEach() function will time out
			await closeSocket(socket);
		});

		it("counts the number of connections", async function() {
			assert.equal(realTimeServer.numberOfActiveConnections(), 0, "before opening connection");

			const socket = await createSocket();
			await waitForConnectionCount(1, "after opening connection");

			assert.equal(realTimeServer.numberOfActiveConnections(), 1, "after opening connection");

			await closeSocket(socket);
		});

		it.only("broadcasts pointer events from one client to all others", async function() {
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
			const EMITTER_ID = "emitter_id";

			const [ receiver1, receiver2 ] = await createSockets(2);

			const listeners = Promise.all([ receiver1, receiver2 ].map((client) => {
				return new Promise((resolve, reject) => {
					client.on(ServerPointerEvent.EVENT_NAME, function(data) {
						try {
							assert.deepEqual(data, clientEvent.toServerEvent(EMITTER_ID).toSerializableObject());
							resolve();
						}
						catch(e) {
							reject(e);
						}
					});
				});
			}));

			realTimeServer.handleClientEvent(clientEvent, EMITTER_ID);

			await listeners;
			await closeSockets(receiver1, receiver2);
		});

		it("replays all previous events when client connects", async function() {
			const IRRELEVANT_ID = "irrelevant";

			const event1 = new ClientDrawEvent(1, 10, 100, 1000);
			const event2 = new ClientDrawEvent(2, 20, 200, 2000);
			const event3 = new ClientDrawEvent(3, 30, 300, 3000);

			realTimeServer.handleClientEvent(event1, IRRELEVANT_ID);
			realTimeServer.handleClientEvent(event2, IRRELEVANT_ID);
			realTimeServer.handleClientEvent(event3, IRRELEVANT_ID);

			let replayedEvents = [];
			const client = await createSocket();
			await new Promise((resolve, reject) => {
				client.on(ServerDrawEvent.EVENT_NAME, function(event) {
					replayedEvents.push(ServerDrawEvent.fromSerializableObject(event));
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
			await closeSocket(client);
		});

		it("sends 'remove pointer' event to other browsers when client disconnects", async function() {
			const [ disconnector, client ] = await createSockets(2);
			const disconnectorId = disconnector.id;

			const listenerPromise = new Promise((resolve, reject) => {
				client.on(ServerRemovePointerEvent.EVENT_NAME, function(eventData) {
					try {
						const event = ServerRemovePointerEvent.fromSerializableObject(eventData);
						assert.equal(event.id, disconnectorId);
						resolve();
					}
					catch(err) {
						reject(err);
					}
				});
			});
			await closeSocket(disconnector);
			await listenerPromise;  // if disconnect event doesn't fire, the test will time out

			await closeSocket(client);
		});

		async function checkEventReflection(clientEvent, serverEventConstructor) {
			const [ emitter, receiver1, receiver2 ] = await createSockets(3);

			emitter.on(serverEventConstructor.EVENT_NAME, function() {
				assert.fail("emitter should not receive its own events");
			});

			const listenerPromise = Promise.all([ receiver1, receiver2 ].map((client) => {
				return new Promise((resolve, reject) => {
					client.on(serverEventConstructor.EVENT_NAME, (data) => {
						try {
							assert.deepEqual(data, clientEvent.toServerEvent(emitter.id).toSerializableObject());
							resolve();
						}
						catch (err) {
							reject(err);
						}
					});
				});
			}));

			emitter.emit(clientEvent.name(), clientEvent.toSerializableObject());

			console.log("WAITING FOR LISTENER");
			await listenerPromise;
			console.log("WAITING FOR CLOSE");
			await closeSockets(emitter, receiver1, receiver2);
			console.log("DONE");
		}

		async function waitForConnectionCount(expectedConnections, message) {
			const TIMEOUT = 1000; // milliseconds
			const RETRY_PERIOD = 10; // milliseconds

			var startTime = Date.now();
			let success = false;

			while(!success && !isTimeUp(TIMEOUT)) {
				await timeoutPromise(RETRY_PERIOD);
				success = (expectedConnections === realTimeServer.numberOfActiveConnections());
			}
			assert.equal(realTimeServer.numberOfActiveConnections(), expectedConnections, message);

			function isTimeUp(timeout) {
				return (startTime + timeout) < Date.now();
			}

			function timeoutPromise(milliseconds) {
				return new Promise((resolve) => {
					setTimeout(resolve, milliseconds);
				});
			}
		}

		function createSockets(numSockets) {
			let createPromises = [];
			for (let i = 0; i < numSockets; i++) {
				createPromises.push(createSocket());
			}
			return Promise.all(createPromises);
		}

		async function closeSockets(...sockets) {
			await Promise.all(sockets.map(async (socket) => {
				await closeSocket(socket);
			}));
		}

		function createSocket() {
			// If the socket will be closed immediately after creation, must use the callback to prevent a
			// race condition bug in Socket.IO. Otherwise, there will be situations where the client will think
			// the socket is closed, but it remains open. See https://github.com/socketio/socket.io-client/issues/1133

			var socket = io("http://localhost:" + PORT);
			return new Promise(function(resolve) {
				socket.on("connect", function() {
					return resolve(socket);
				});
			});
		}

		function closeSocket(socket) {
			var closePromise = new Promise(function(resolve) {
				socket.on("disconnect", function() {
					return resolve();
				});
			});
			socket.disconnect();

			return closePromise;
		}

	});

}());