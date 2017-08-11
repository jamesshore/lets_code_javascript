// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const FAKE_START_TIME = 424242;

	module.exports = class Clock {

		constructor(useFake) {
			this._useFake = useFake;
			if (useFake) this._now = FAKE_START_TIME;
		}

		static createFake() {
			return new Clock(true);
		}

		now() {
			if (this._useFake) return this._now;
			else return Date.now();
		}

		tick(milliseconds) {
			if (!this._useFake) throw new Error("Attempted to tick() system clock. Should be a fake clock instead.");
			this._now += milliseconds;
		}

		millisecondsSince(startTimeInMilliseconds) {
			return this.now() - startTimeInMilliseconds;
		}

	};

}());