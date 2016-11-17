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

		it("only calls connect() and disconnect() callbacks once", function(done) {
			var connectCallback = 0;
			var disconnectCallback = 0;

			connection.connect(harness.PORT, function(err) {
				if (err) return done(err);
				connectCallback++;

				connection.disconnect(function(err) {
					if (err) return done(err);
					disconnectCallback++;

					connection.connect(harness.PORT, function(err) {
						if (err) return done(err);

						assert.equal(connectCallback, 1, "connect callback");
						assert.equal(disconnectCallback, 1, "disconnect callback");
						done();
					});
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

		it("sends pointer location to Socket.IO server", function(done) {
			connection.connect(harness.PORT, function() {
				connection.sendPointerLocation(50, 75);

				harness.waitForPointerLocation(connection, function(error, location) {
					assert.deepEqual(location, new ClientPointerEvent(50, 75).toSerializableObject());
					connection.disconnect(done);
				});
			});
		});

		it("gets most recent pointer location sent to Socket.IO server, even if it hasn't be received yet", function(done) {
			connection.connect(harness.PORT, function() {
				assert.deepEqual(connection.getLastSentPointerLocation(), null, "should not have a location if nothing sent");
				connection.sendPointerLocation(50, 75);
				assert.deepEqual(connection.getLastSentPointerLocation(), { x: 50, y: 75 }, "should return last sent value");
				connection.disconnect(done);
			});
		});

		it("receives pointer location from Socket.IO server", function(done) {
			var EXPECTED_EVENT = new ServerPointerEvent(0xdeadbeef, 90, 160);

			connection.connect(harness.PORT, function() {

				connection.onPointerLocation(function(event) {
					assert.deepEqual(event, EXPECTED_EVENT);
					connection.disconnect(done);
				});

				harness.sendPointerLocation(connection, EXPECTED_EVENT, function() {});
			});
		});

		it("can trigger pointer location event manually", function(done) {
			var EXPECTED_EVENT = new ServerPointerEvent(0xdeadbeef, 90, 160);

			connection.connect(harness.PORT, function() {
				connection.onPointerLocation(function(event) {
					assert.deepEqual(event, EXPECTED_EVENT);
					connection.disconnect(done);
				});

				connection.triggerPointerLocation(0xdeadbeef, 90, 160);
				// if triggerPointerLocation doesn't do anything, the test will time out
			});
		});

		it("can trigger pointer location event even when no one listening", function(done) {
			connection.connect(harness.PORT, function() {
				connection.triggerPointerLocation(0xdeadbeef, 12, 23);
				connection.disconnect(done);
			});
		});

		it("provides socket ID", function(done) {
			connection.connect(harness.PORT, function() {
				var socketId = connection.getSocketId();
				assert.defined(socketId, "should return socket ID after connecting");
				connection.disconnect(function() {
					assert.equal(connection.getSocketId(), null, "should return null after disconnecting");
					done();
				});
			});
		});

		it("provides server port", function(done) {
			connection.connect(harness.PORT, function() {
				assert.equal(connection.getPort(), harness.PORT, "should return connection port after connecting");
				connection.disconnect(function() {
					assert.equal(connection.getPort(), null, "should return null after disconnecting");
					done();
				});
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
			assert.throws(connection.getLastSentPointerLocation.bind(connection), expectedMessage, "getLastSentPointerLocation()");
			assert.throws(connection.onPointerLocation.bind(connection, callback), expectedMessage, "onPointerLocation()");
			assert.throws(connection.triggerPointerLocation.bind(connection), expectedMessage, "triggerPointerLocation()");
			assert.throws(connection.getSocketId.bind(connection), expectedMessage, "getSocketId()");
			assert.throws(connection.getPort.bind(connection), expectedMessage, "getPort()");

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

				connection.disconnect(function(err2) {
					assert.equal(err2, null, "disconnect() should not have error");
					done();
				});
			});
		});

		it("closes connection asynchronously", function(done) {
			connection.connect(harness.PORT, function(err) {
				if (err) return done(err);

				var timeoutCalled = false;
				setTimeout(function() {
					timeoutCalled = true;
				}, 0);

				connection.disconnect(function(err) {
					if (err) return done(err);
					assert.equal(timeoutCalled, true, "if disconnect is asynchronous, other asynchronous code should have run");
					done();
				});
			});
		});

		it("connect() can be called without callback", function() {
			connection.connect(harness.PORT);
			// expect no exception
		});

		it("it ignores attempts to send pointer status to Socket.IO server", function(done) {
			connection.connect(harness.PORT, function() {
				connection.sendPointerLocation(50, 75);
				done();
			});
		});

		it("gets most recent attempt to send pointer location, even though nothing is actually sent", function(done) {
			connection.connect(harness.PORT, function() {
				assert.deepEqual(connection.getLastSentPointerLocation(), null, "should not have a location if nothing sent");
				connection.sendPointerLocation(50, 75);
				assert.deepEqual(connection.getLastSentPointerLocation(), { x: 50, y: 75 }, "should return last sent value");
				done();
			});
		});

		it("can trigger pointer location event manually", function(done) {
			var EXPECTED_EVENT = new ServerPointerEvent(0xdeadbeef, 90, 160);

			connection.connect(harness.PORT, function() {
				connection.onPointerLocation(function(event) {
					assert.deepEqual(event, EXPECTED_EVENT);
					done();
				});

				connection.triggerPointerLocation(0xdeadbeef, 90, 160);
				// if triggerPointerLocation doesn't do anything, the test will time out
			});
		});

		it("can trigger pointer location event even when no one listening", function(done) {
			connection.connect(harness.PORT, function() {
				connection.triggerPointerLocation(0xdeadbeef, 12, 23);
				done();
			});
		});

		it("provides a null socket ID", function(done) {
			connection.connect(harness.PORT, function() {
				assert.equal(connection.getSocketId(), "NullConnection");
				connection.disconnect(function() {
					assert.equal(connection.getSocketId(), null, "should return null after disconnecting");
					done();
				});
			});
		});

		it("provides server port", function(done) {
			connection.connect(harness.PORT, function() {
				assert.equal(connection.getPort(), harness.PORT, "should return connection port after connecting");
				connection.disconnect(function() {
					assert.equal(connection.getPort(), null, "should return null after disconnecting");
					done();
				});
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
			assert.throws(connection.getLastSentPointerLocation.bind(connection), expectedMessage, "getLastSentPointerLocation()");
			assert.throws(connection.onPointerLocation.bind(connection, callback), expectedMessage, "onPointerLocation()");
			assert.throws(connection.triggerPointerLocation.bind(connection), expectedMessage, "triggerPointerLocation()");
			assert.throws(connection.getSocketId.bind(connection), expectedMessage, "getSocketId()");
			assert.throws(connection.getPort.bind(connection), expectedMessage, "getPort()");

			function callback() {
				assert.fail("Callback should never be called");
			}
		});

	});

}());