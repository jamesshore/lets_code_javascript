// Copyright (c) 2015-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var harness = require("./__test_harness_client.js");
	var Connection = require("./real_time_connection.js");
	var async = require("./vendor/async-1.5.2.js");
	var ServerPointerEvent = require("../../shared/server_pointer_event.js");
	var ClientPointerEvent = require("../../shared/client_pointer_event.js");

	describe("NET: RealTimeConnection", function() {

		var connection;

		beforeEach(function() {
			connection = new Connection();
		});

		it("connects and disconnects from Socket.IO server", function(done) {
			connection.connect(harness.PORT, function(err) {
				assert.equal(err, null, "connect() should not have error");
				assert.equal(harness.isConnected(connection), true, "client should have connected to server");

				connection.disconnect(function(err2) {
					assert.equal(err2, null, "disconnect() should not have error");
					harness.waitForServerDisconnect(connection, done);   // will timeout if disconnect doesn't work
				});
			});
		});

		it("connect() can be called without callback", function(done) {
			connection.connect(harness.PORT);
			async.until(test, fn, done);

			function test() {
				return connection.isConnected();
			}

			function fn(callback) {
				setTimeout(callback, 50);
			}
		});

		it("sends pointer status to Socket.IO server", function(done) {
			connection.connect(harness.PORT, function() {
				connection.sendPointerLocation(50, 75);

				harness.waitForPointerLocation(connection, function(error, location) {
					assert.deepEqual(location, new ClientPointerEvent(50, 75).toSerializableObject());
					connection.disconnect(done);
				});
			});
		});

		it("receives pointer status from Socket.IO server", function(done) {
			var EXPECTED_EVENT = new ServerPointerEvent(0xdeadbeef, 90, 160);

			connection.connect(harness.PORT, function() {

				connection.onPointerLocation(function(event) {
					assert.deepEqual(event, EXPECTED_EVENT);
					connection.disconnect(done);
				});

				harness.sendPointerLocation(connection, EXPECTED_EVENT, function() {});
			});
		});

		it("provides socket ID", function(done) {
			connection.connect(harness.PORT, function() {
				assert.defined(connection.getSocketId());
				connection.disconnect(done);
			});
		});

		it("checks status of connection", function(done) {
			assert.equal(connection.isConnected(), false, "should not be connected before connect() is called");

			connection.connect(harness.PORT, function() {
				assert.equal(connection.isConnected(), true, "should be connected after connect() is complete");
				connection.disconnect(function() {
					assert.equal(connection.isConnected(), false, "should not be connected after disconnect() is complete");
					done();
				});
			});
		});

		it("fails fast when methods are called before connect() is called", function() {
			var expectedMessage = "Connection used before connect() called";

			assert.throws(connection.disconnect.bind(connection, callback), expectedMessage, "disconnect()");
			assert.throws(connection.sendPointerLocation.bind(connection, 0, 0), expectedMessage, "sendPointerLocation()");
			assert.throws(connection.onPointerLocation.bind(connection, callback), expectedMessage, "onPointerLocation()");
			assert.throws(connection.getSocketId.bind(connection), expectedMessage, "getSocketId()");

			function callback() {
				assert.fail("Callback should never be called");
			}
		});

	});

	describe("NET: Null RealTimeConnection", function() {

		var connection;

		beforeEach(function() {
			connection = Connection.createNull();
		});

		it("connects and disconnects without talking to Socket.IO server", function(done) {
			connection.connect(harness.PORT, function(err) {
				assert.equal(err, null, "connect() should not have error");
				assert.equal(harness.isConnected(connection), false, "client should not have connected to server");

				// connection.disconnect(function(err2) {
				// 	assert.equal(err2, null, "disconnect() should not have error");
				// 	harness.waitForServerDisconnect(connection, done);   // will timeout if disconnect doesn't work
				// });
			});
		});

	});

}());