// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	const Server = require("./server.js");
	const fs = require("fs");
	const http = require("http");
	const assert = require("_assert");
	const ClientPointerEvent = require("../shared/client_pointer_event.js");
	const ServerPointerEvent = require("../shared/server_pointer_event.js");
	const SocketIoClient = require("./__socket_io_client.js");

	const CONTENT_DIR = "generated/test/";
	const NOT_FOUND_PAGE = "test404.html";
	const PORT = 5020;

	const INDEX_PAGE = "index.html";
	const INDEX_PAGE_CONTENTS = "This is the index page.";

	describe("Server", function() {

		let socketIoClient;
		let server;

		beforeEach(function(done) {
			fs.writeFile(CONTENT_DIR + INDEX_PAGE, INDEX_PAGE_CONTENTS, done);
		});

		afterEach(function(done) {
			fs.unlink(CONTENT_DIR + INDEX_PAGE, done);
		});

		beforeEach(async function() {
			server = new Server();
			await server.start(CONTENT_DIR, NOT_FOUND_PAGE, PORT);
			socketIoClient = new SocketIoClient("http://localhost:" + PORT, server._realTimeServer._socketIoAbstraction);
		});

		afterEach(async function() {
			try {
				await waitForConnectionCount(0, "afterEach() requires all sockets to be closed");
			}
			finally {
				await server.stop();
			}
		});

		it("serves HTML", function(done) {
			http.get("http://localhost:" + PORT, function(response) {
				let receivedData = "";
				response.setEncoding("utf8");

				response.on("data", function(chunk) {
					receivedData += chunk;
				});
				response.on("error", function(err) {
					assert.fail(err);
				});
				response.on("end", function() {
					assert.equal(receivedData, INDEX_PAGE_CONTENTS);
					done();
				});
			});
		});

		it("services real-time events", async function() {
			// Need to create our sockets serially because the tests won't exit if we don't.
			// I believe it's a bug in Socket.IO but I haven't been able to reproduce with a
			// trimmed-down test case. If you want to try converting this back to a parallel
			// implementation, be sure to run the tests about ten times because the issue doesn't
			// always occur. -JDLS 4 Aug 2017

			const emitter = await socketIoClient.createSocket();
			const receiver = await socketIoClient.createSocket();
			const clientEvent = new ClientPointerEvent(100, 200);

			emitter.emit(clientEvent.name(), clientEvent.payload());

			await new Promise((resolve, reject) => {
				receiver.on(ServerPointerEvent.EVENT_NAME, function(data) {
					try {
						assert.deepEqual(data, clientEvent.toServerEvent(emitter.id).payload());
						resolve();
					}
					catch(err) {
						reject(err);
					}
				});
			});

			await new Promise((resolve) => setTimeout(resolve, 0));
			await socketIoClient.closeSocket(emitter);
			await socketIoClient.closeSocket(receiver);
		});

		// Duplicated with _real_time_server_test.js
		async function waitForConnectionCount(expectedConnections, message) {
			const TIMEOUT = 1000; // milliseconds
			const RETRY_PERIOD = 10; // milliseconds

			const startTime = Date.now();
			const realTimeServer = server._realTimeServer;
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

	});

}());