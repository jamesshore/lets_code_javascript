// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const lolex = require("lolex");

	const FAKE_START_TIME = 424242;

	class RealClock {
		get Date() { return Date; }
		tick() { throw new Error("Attempted to tick() system clock. Should be a fake clock instead."); }
		setInterval(fn, milliseconds) { return setInterval(fn, milliseconds); }
		clearInterval(id) { clearInterval(id); }
	}

	module.exports = class Clock {

		constructor() {
			this._clock = new RealClock();
		}

		static createFake() {
			var clock = new Clock(true);
			clock._clock = lolex.createClock(FAKE_START_TIME);
			return clock;
		}

		now() {
			return this._clock.Date.now();
		}

		tick(milliseconds) {
			this._clock.tick(milliseconds);
		}

		millisecondsSince(startTimeInMilliseconds) {
			return this.now() - startTimeInMilliseconds;
		}

		setInterval(fn, intervalInMilliseconds) {
			var handle = this._clock.setInterval(fn, intervalInMilliseconds);
			return {
				clear: function() {
					this._clock.clearInterval(handle);
				}.bind(this)
			};
		}

	};

}());