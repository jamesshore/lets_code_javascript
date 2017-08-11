// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const FAKE_START_TIME = 424242;

	module.exports = class Clock {

		constructor(useFake) {
			this._useFake = useFake;
		}

		static createFake() {
			return new Clock(true);
		}

		now() {
			if (this._useFake) return FAKE_START_TIME;
			else return Date.now();
		}
	};

}());