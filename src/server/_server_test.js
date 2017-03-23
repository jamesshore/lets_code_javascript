// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var Server = require("./server.js");
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

	var CONTENT_DIR = "generated/test";

	var INDEX_PAGE = "index.html";
	var OTHER_PAGE = "other.html";
	var NOT_FOUND_PAGE = "test404.html";

	var INDEX_PAGE_DATA = "This is index page file";
	var OTHER_PAGE_DATA = "This is another page";
	var NOT_FOUND_DATA = "This is 404 page file";

	var PORT = 5020;
	var BASE_URL = "http://localhost:" + PORT;

	var TEST_FILES = [
		[ CONTENT_DIR + "/" + INDEX_PAGE, INDEX_PAGE_DATA],
		[ CONTENT_DIR + "/" + OTHER_PAGE, OTHER_PAGE_DATA],
		[ CONTENT_DIR + "/" + NOT_FOUND_PAGE, NOT_FOUND_DATA]
	];

	describe("HTTP Server", function() {

		var server;

		beforeEach(function(done) {
			server = new Server();
			async.each(TEST_FILES, createTestFile, done);
		});

		afterEach(function(done) {
			async.each(TEST_FILES, deleteTestFile, done);
		});

		it("serves files from directory", function(done) {
			httpGet(BASE_URL + "/" + INDEX_PAGE, function(response, responseData) {
				assert.equal(response.statusCode, 200, "status code");
				assert.equal(responseData, INDEX_PAGE_DATA, "response text");
				done();
			});
		});

		it("sets content-type and charset for HTML files", function(done) {
			httpGet(BASE_URL + "/" + INDEX_PAGE, function(response, responseData) {
				assert.equal(response.headers["content-type"], "text/html; charset=UTF-8", "content-type header");
				done();
			});
		});

		it("supports multiple files", function(done) {
			httpGet(BASE_URL + "/" + OTHER_PAGE, function(response, responseData) {
				assert.equal(response.statusCode, 200, "status code");
				assert.equal(responseData, OTHER_PAGE_DATA, "response text");
				done();
			});
		});

		it("serves index.html when asked for home page", function(done) {
			httpGet(BASE_URL, function(response, responseData) {
				assert.equal(response.statusCode, 200, "status code");
				assert.equal(responseData, INDEX_PAGE_DATA, "response text");
				done();
			});
		});

		it("returns 404 when file doesn't exist", function(done) {
			httpGet(BASE_URL + "/bargle", function(response, responseData) {
				assert.equal(response.statusCode, 404, "status code");
				assert.equal(responseData, NOT_FOUND_DATA, "404 text");
				done();
			});
		});

		it("sets content-type and charset for 404 page", function(done) {
			httpGet(BASE_URL + "/bargle", function(response, responseData) {
				assert.equal(response.headers["content-type"], "text/html; charset=UTF-8", "content-type header");
				done();
			});
		});

		it("requires home page parameter", function() {
			assert.throws(function() {
				server.start();
			});
		});

		it("requires 404 page parameter", function() {
			assert.throws(function() {
				server.start(CONTENT_DIR);
			});
		});

		it("requires port parameter", function() {
			assert.throws(function() {
				server.start(CONTENT_DIR, NOT_FOUND_PAGE);
			});
		});

		it("runs callback when stop completes", function(done) {
			server.start(CONTENT_DIR, NOT_FOUND_PAGE, PORT);
			server.stop(function() {
				done();
			});
		});

		it("stop() provides error parameter if the server isn't running", function(done) {
			server.stop(function(err) {
				assert.defined(err);
				done();
			});
		});

		function httpGet(url, callback) {
			server.start(CONTENT_DIR, NOT_FOUND_PAGE, PORT, function() {
				http.get(url, function(response) {
					var receivedData = "";
					response.setEncoding("utf8");

					response.on("data", function(chunk) {
						receivedData += chunk;
					});
					response.on("error", function(err) {
						console.log("ERROR", err);
					});
					response.on("end", function() {
						server.stop(function() {
							callback(response, receivedData);
						});
					});
				});
			});
		}

	});


	describe("Socket.io Server", function() {

		var server;

		beforeEach(function(done) {
			server = new Server();
			server.start(CONTENT_DIR, NOT_FOUND_PAGE, PORT, done);
		});

		afterEach(function(done) {
			server.stop(done);
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

		it.only("replays all previous events on client connection", function(done) {
			var event1 = new ClientDrawEvent(1, 10, 100, 1000);
			var event2 = new ClientDrawEvent(2, 20, 200, 2000);
			var event3 = new ClientDrawEvent(2, 20, 200, 2000);

			var sendClient = createSocket();
			var waitForServerClient = createSocket();

			var numEventsReceived = 0;
			waitForServerClient.on(ServerDrawEvent.EVENT_NAME, function(event) {
				console.log("WAIT FOR SERVER - EVENT");
				numEventsReceived++;
				if (numEventsReceived === 3) {
					// we've confirmed that all events have been reflected by the server, which means the server should
					// be ready for client2 to connect.
					console.log("ALL SERVER EVENTS RECEIVED");
					checkEventReplay();
				}
			});

			console.log("EMITTING EVENTS");
			sendClient.emit(event1.name(), event1.toSerializableObject());
			sendClient.emit(event2.name(), event2.toSerializableObject());
			sendClient.emit(event3.name(), event3.toSerializableObject());

			function checkEventReplay() {
				console.log("CHECKING REPLAY");
				var checkReplayClient = createSocket();

				var replayedEvents = [];
				checkReplayClient.on("server_draw_event", function(event) {
					console.log("CHECK REPLAY - EVENT");
					replayedEvents.push(ServerDrawEvent.fromSerializableObject(event));

					if (replayedEvents.length === 3) {
						// if we don't get the events, the test will time out
						assert.deepEqual(replayedEvents, [ event1, event2, event3 ]);
						end();
					}
				});

				function end() {
					async.each([sendClient, waitForServerClient, checkReplayClient], closeSocket, done);
				}
			}

		});

		it("doesn't send replayed events to all connected clients; just the one that connected");

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


	function createTestFile(fileAndData, done) {
		// Note: writeFile() MUST be called asynchronously in order for this code to work on Windows 7.
		// If it's called synchronously, it fails with an EPERM error when the second test starts. This
		// may be related to this Node.js issue: https://github.com/joyent/node/issues/6599
		// This issue appeared after upgrading send 0.2.0 to 0.9.3. Prior to that, writeFileSync()
		// worked fine.
		fs.writeFile(fileAndData[0], fileAndData[1], function(err) {
			if (err) console.log("could not create test file: [" + fileAndData[0] + "]. Error: " + err);
			done();
		});
	}

	function deleteTestFile(fileAndData, done) {
		// Note: unlink() MUST be called asynchronously here in order for this code to work on Windows 7.
		// If it's called synchronously, then it will run before the file is closed, and that is not allowed
		// on Windows 7. It's possible that this is the result of a Node.js bug; see this issue for details:
		// https://github.com/joyent/node/issues/6599
		var file = fileAndData[0];
		if (fs.existsSync(file)) {
			fs.unlink(file, function(err) {
				if (err || fs.existsSync(file)) console.log("could not delete test file: [" + file + "]. Error: " + err);
				done();
			});
		}
	}

}());