// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("../../shared/_assert.js");
	var harness = require("./_network_test_harness.js");
	var network = require("./real_time_network.js");

	describe("NET: Real Time Network", function() {

		it("connects to Socket.IO server", function(done) {
			network.connect(harness.PORT, function(socketId) {
				assert.equal(harness.client.isConnected(socketId), true, "client should have connected to server");
				done();
			});
		});

	});

}());