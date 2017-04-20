// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var Server = require("./server.js");
	var fs = require("fs");
	var http = require("http");
	var async = require("async");
	var assert = require("_assert");
	var io = require("socket.io-client");
	var ClientPointerEvent = require("../shared/client_pointer_event.js");
	var ServerPointerEvent = require("../shared/server_pointer_event.js");

	var CONTENT_DIR = "generated/test/";
	var NOT_FOUND_PAGE = "test404.html";
	var PORT = 5020;

	var INDEX_PAGE = "index.html";
	var INDEX_PAGE_CONTENTS = "This is the index page.";

	describe("Server", function() {

		var server;

		beforeEach(function(done) {
			fs.writeFile(CONTENT_DIR + INDEX_PAGE, INDEX_PAGE_CONTENTS, done);
		});

		afterEach(function(done) {
			fs.unlink(CONTENT_DIR + INDEX_PAGE, done);
		});

		beforeEach(function(done) {
			server = new Server();
			server.start(CONTENT_DIR, NOT_FOUND_PAGE, PORT, done);
		});

		afterEach(function(done) {
			server.stop(done);
		});

		it("serves HTML", function(done) {
			http.get("http://localhost:" + PORT, function(response) {
				var receivedData = "";
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

		it("services real-time events", function(done) {
			var emitter = createSocket();
			var receiver = createSocket();

			var clientEvent = new ClientPointerEvent(100, 200);

			receiver.on(ServerPointerEvent.EVENT_NAME, function(data) {
				assert.deepEqual(data, clientEvent.toServerEvent(emitter.id).toSerializableObject());
				end();
			});

			emitter.emit(clientEvent.name(), clientEvent.toSerializableObject());

			function end() {
				async.each([ emitter, receiver ], closeSocket, done);
			}
		});

		function createSocket() {
			return io("http://localhost:" + PORT);
		}

		function closeSocket(socket, callback) {
			socket.disconnect();
			callback();
		}

	});

}());