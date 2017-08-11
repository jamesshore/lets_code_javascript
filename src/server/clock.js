// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const FAKE_START_TIME = 424242;

	class RealClock {

		now() {
			return Date.now();
		}

		tick() {
			throw new Error("Attempted to tick() system clock. Should be a fake clock instead.");
		}

	}

	class FakeClock {

		constructor() {
			this._now = FAKE_START_TIME;
		}

		now() {
			return this._now;
		}

		tick(milliseconds) {
			this._now += milliseconds;
		}

	}


	module.exports = class Clock {

		constructor() {
			this._clock = new RealClock();
		}

		static createFake() {
			var clock = new Clock(true);
			clock._clock = new FakeClock();
			return clock;
		}

		now() {
			return this._clock.now();
		}

		tick(milliseconds) {
			this._clock.tick(milliseconds);
		}

		millisecondsSince(startTimeInMilliseconds) {
			return this.now() - startTimeInMilliseconds;
		}

	};


}());