// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("../../shared/_assert.js");
	var harness = require("./_network_test_harness.js");
	var network = require("./real_time_network.js");

	describe("NET: Real Time Network", function() {

		it("connects and disconnects from Socket.IO server", function(done) {
			network.connect(harness.PORT, function(socketId) {
				assert.equal(harness.client.isConnected(socketId), true, "client should have connected to server");

				network.disconnect(function() {
					harness.client.waitForServerDisconnect(socketId, done);   // will timeout if disconnect doesn't work
				});
			});
		});

		it("sends pointer status to Socket.IO server", function(done) {
			network.connect(harness.PORT, function(socketId) {

				network.sendPointerLocation(50, 75);

				assert.deepEqual(harness.client.lastPointerLocation(), { x: 50, y: 75 });

				network.disconnect(done);
			});
		});
	});

}());