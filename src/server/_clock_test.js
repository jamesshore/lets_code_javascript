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

		it("fake clock runs a function every n milliseconds", function(done) {
			const interval = fakeClock.setInterval(done, 10000);
			fakeClock.tick(10000);
			interval.clear();
			fakeClock.tick(10000);  // if clear() didn't work, done() will called twice and the test will fail
		});

		it("real clock runs a function every >=n milliseconds", function(done) {
			let intervalCalled = false;
			const startTime = realClock.now();
			const interval = realClock.setInterval(() => {
				try {
					// If there's a GC cycle or other delay, this function may get called twice; prevent it
					if (!intervalCalled) {
						intervalCalled = true;
						assert.gte(realClock.millisecondsSince(startTime), 10);
						interval.clear();
						done();
					}
				}
				catch(err) { done(err); }
			}, 10);
		});

	});

}());