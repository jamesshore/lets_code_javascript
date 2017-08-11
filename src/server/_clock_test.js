// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const assert = require("_assert");
	const Clock = require("./clock.js");

	describe("Clock", function() {

		it("attaches to real system clock by default", function(done) {
			const clock = new Clock();
			const startTime = clock.now();
			setTimeout(() => {
				try {
					const elapsedTime = clock.now() - startTime;
					assert.lte(10, elapsedTime);
					done();
				}
				catch (err) { done(err); }
			}, 10);
		});

		it("can use fake clock instead of real system clock", function() {
			const clock = Clock.createFake();
			assert.equal(clock.now(), 424242);
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