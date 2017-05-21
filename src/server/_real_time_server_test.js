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
		var httpServer;
		var realTimeServer;

		beforeEach(function(done) {
			httpServer = new HttpServer(IRRELEVANT_DIR, IRRELEVANT_PAGE);
			realTimeServer = new RealTimeServer();

			realTimeServer.start(httpServer.getNodeServer());
			httpServer.start(PORT, done);
		});

        afterEach(function(done) {
			assert.equal(realTimeServer.numberOfActiveConnections(), 0, "afterEach() requires all sockets to be closed");
            httpServer.stop(done);
		});

        it("emits event when all sockets have disconnected", function (done) {
            var isAfterDisconnect = false;
            realTimeServer.on('disconnect_all', function () {
                assert.equal(isAfterDisconnect, true, "after closing connection");
                done();
            });

            var socket = createSocket();
            socket.on('connect', function () {
                socket.disconnect();
                isAfterDisconnect = true;
            });

        });

		it("counts the number of connections", function(done) {
            assert.equal(realTimeServer.numberOfActiveConnections(), 0, "before opening connection");

            var gotConnectionEvent = false;
            realTimeServer.on('connection', function () {
                assert.equal(realTimeServer.numberOfActiveConnections(), 1, "after opening connection");
                gotConnectionEvent = true;
            }).on('disconnect', function () {
                assert.equal(gotConnectionEvent, true, "expected connection event before disconnect event");
                assert.equal(realTimeServer.numberOfActiveConnections(), 0, "after closing connection");
                done();
            });

            var socket = createSocket();
            socket.once('connect', socket.disconnect);
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

		it("treats events received via method call exactly like events received via Socket.IO", function(done) {
			var clientEvent = new ClientPointerEvent(100, 200);
			var EMITTER_ID = "emitter_id";

			var receiver1 = createSocket();
			var receiver2 = createSocket();

			async.each([receiver1, receiver2], function(client, next) {
				client.on(ServerPointerEvent.EVENT_NAME, function(data) {
					try {
						assert.deepEqual(data, clientEvent.toServerEvent(EMITTER_ID).toSerializableObject());
					}
					finally {
						next();
					}
				});
			}, end);

			realTimeServer.handleClientEvent(clientEvent, EMITTER_ID);

            function end() {
                disconnectAll([receiver1, receiver2], done);
			}
		});

		it("replays all previous events when client connects", function(done) {
			var IRRELEVANT_ID = "irrelevant";

			var event1 = new ClientDrawEvent(1, 10, 100, 1000);
			var event2 = new ClientDrawEvent(2, 20, 200, 2000);
			var event3 = new ClientDrawEvent(3, 30, 300, 3000);

			realTimeServer.handleClientEvent(event1, IRRELEVANT_ID);
			realTimeServer.handleClientEvent(event2, IRRELEVANT_ID);
			realTimeServer.handleClientEvent(event3, IRRELEVANT_ID);

			var replayedEvents = [];
			var client = createSocket();

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
					}
                    finally {
                        disconnectAll([client], done);
					}
				}
			});
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
                disconnectAll([emitter, receiver1, receiver2], done);
			}
        }

        function disconnectAll(sockets, callback) {
            realTimeServer.once('disconnect_all', callback);
            for (var socket of sockets)
                socket.disconnect();
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