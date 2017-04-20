// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var RealTimeServer = require("./real_time_server.js");
	var HttpServer = require("./http_server.js");
	var http = require("http");
	var fs = require("fs");
	var async = require("async");
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
		this.timeout(4 * 1000);

		var httpServer;

		beforeEach(function(done) {
			httpServer = new HttpServer(IRRELEVANT_DIR, IRRELEVANT_PAGE);
			var realTimeServer = new RealTimeServer();

			realTimeServer.start(httpServer.getNodeServer());
			httpServer.start(PORT, done);
		});

		afterEach(function(done) {
			httpServer.stop(done);
		});

		it("broadcasts pointer events from one client to all others", function(done) {
			checkEventReflection(new ClientPointerEvent(100, 200), ServerPointerEvent, done);
		});

		it("broadcasts 'remove pointer' events from one client to all others", function(done) {
			checkEventReflection(new ClientRemovePointerEvent(), ServerRemovePointerEvent, done);
		});

		it("broadcasts draw events from one client to all others", function(done) {
			checkEventReflection(new ClientDrawEvent(100, 200, 300, 400), ServerDrawEvent, done);
		});

		it("broadcasts clear screen events from one client to all others", function(done) {
			checkEventReflection(new ClientClearScreenEvent(), ServerClearScreenEvent, done);
		});

		it("replays all previous events when client connects", function(done) {
			var event1 = new ClientDrawEvent(1, 10, 100, 1000);
			var event2 = new ClientDrawEvent(2, 20, 200, 2000);
			var event3 = new ClientDrawEvent(3, 30, 300, 3000);

			var sendClient = createSocket();
			var waitForServerClient = createSocket();

			var numEventsReceived = 0;
			waitForServerClient.on(ServerDrawEvent.EVENT_NAME, function(event) {
				numEventsReceived++;
				if (numEventsReceived === 3) {
					// we've confirmed that all events have been reflected by the server, which means the server should
					// be ready for client2 to connect.
					checkEventReplay();
				}
				if (numEventsReceived > 3) {
					assert.fail("Received more events than expected: " + JSON.stringify(event));
				}
			});

			sendClient.emit(event1.name(), event1.toSerializableObject());
			sendClient.emit(event2.name(), event2.toSerializableObject());
			sendClient.emit(event3.name(), event3.toSerializableObject());

			function checkEventReplay() {
				var checkReplayClient = createSocket();

				var replayedEvents = [];
				checkReplayClient.on("server_draw_event", function(event) {
					replayedEvents.push(ServerDrawEvent.fromSerializableObject(event));

					if (replayedEvents.length === 3) {
						// if we don't get the events, the test will time out
						assert.deepEqual(replayedEvents, [
							event1.toServerEvent(),
							event2.toServerEvent(),
							event3.toServerEvent()
						]);
						end();
					}
				});

				function end() {
					async.each([sendClient, waitForServerClient, checkReplayClient], closeSocket, done);
				}
			}

		});

		function checkEventReflection(clientEvent, serverEventConstructor, done) {
			var emitter = createSocket();
			var receiver1 = createSocket();
			var receiver2 = createSocket();

			emitter.on(serverEventConstructor.EVENT_NAME, function() {
				assert.fail("emitter should not receive its own events");
			});

			async.each([receiver1, receiver2], function(client, next) {
				client.on(serverEventConstructor.EVENT_NAME, function(data) {
					try {
						assert.deepEqual(data, clientEvent.toServerEvent(emitter.id).toSerializableObject());
					}
					finally {
						next();
					}
				});
			}, end);

			emitter.emit(clientEvent.name(), clientEvent.toSerializableObject());

			function end() {
				async.each([emitter, receiver1, receiver2], closeSocket, done);
			}
		}

		function createSocket() {
			return io("http://localhost:" + PORT);
		}

		function closeSocket(socket, callback) {
			socket.disconnect();
			callback();
		}

	});

}());