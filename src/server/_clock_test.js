// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const assert = require("_assert");
	const Clock = require("./clock.js");

	describe("Clock", function() {

		it("attached to real system by default", function(done) {
			assert.equal(new Clock().now(), Date.now());
		});

		// const fakeClock = Clock.createFake()
		// new Clock();
		// nullClock.tick(15);

		// const lastActivity = clock.now();
		// if (clock.timeSince(lastActivity) > 10000) doSomething();

		// var interval = clock.setInterval(..., 100);
		// interval.clear();
	});

}());