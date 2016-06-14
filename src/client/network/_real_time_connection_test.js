// Copyright (c) 2015-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("../../shared/_assert.js");
	var harness = require("./_network_test_harness.js");
	var Connection = require("./real_time_connection.js");
	var async = require("./vendor/async-1.5.2.js");

	describe("NET: Real Time Network", function() {

		var connection;

		beforeEach(function() {
			connection = new Connection();
		});

		it("connects and disconnects from Socket.IO server", function(done) {
			connection.connect(harness.PORT, function(err) {
				assert.equal(err, null, "connect() should not have error");
				assert.equal(harness.client.isConnected(connection), true, "client should have connected to server");

				connection.disconnect(function(err2) {
					assert.equal(err2, null, "disconnect() should not have error");
					harness.client.waitForServerDisconnect(connection, done);   // will timeout if disconnect doesn't work
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

				harness.client.waitForPointerLocation(connection, function(location) {
					assert.deepEqual(location, { x: 50, y: 75 });
					connection.disconnect(done);
				});
			});
		});

		it.skip("receives pointer status from Socket.IO server", function(done) {
			connection.connect(harness.PORT, function() {

				connection.onPointerLocation(function(x, y) {
					assert.equal(x, 90, "x");
					assert.equal(y, 160, "y");

					connection.disconnect(done);
				});

				harness.client.sendPointerLocation(50, 75);
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

}());