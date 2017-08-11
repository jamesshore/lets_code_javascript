// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const lolex = require("lolex");

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
			this._lolex = lolex.createClock();
			// this._now = FAKE_START_TIME;
		}

		now() {
			this._lolex.Date.now();
		}

		tick(milliseconds) {
			this._lolex.tick();
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