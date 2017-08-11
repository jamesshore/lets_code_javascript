// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const assert = require("_assert");
	const Clock = require("./clock.js");

	describe("Clock", function() {

		let realClock;
		let fakeClock;

		beforeEach(function() {
			realClock = new Clock();
			fakeClock = Clock.createFake();
		});

		it("attaches to real system clock by default", function(done) {
			const startTime = realClock.now();
			setTimeout(() => {
				try {
					const elapsedTime = realClock.now() - startTime;
					assert.gte(elapsedTime, 10);
					done();
				}
				catch (err) { done(err); }
			}, 10);
		});

		it("can use fake clock instead of real system clock", function() {
			assert.equal(fakeClock.now(), 424242);
		});

		it("ticks the fake clock", function() {
			const startTime = fakeClock.now();
			fakeClock.tick(10000);
			assert.equal(fakeClock.now(), startTime + 10000);
		});

		it("fails fast when attempting to tick system clock", function() {
			assert.exception(() => realClock.tick());
		});

		it("tells us how many milliseconds have elapsed", function() {
			const startTime = fakeClock.now();
			fakeClock.tick(999);
			assert.equal(fakeClock.millisecondsSince(startTime), 999);
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