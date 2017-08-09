// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	module.exports = class EventRepository {
		constructor() {
			this._data = [];
		}

		store(event) {
			this._data.push(event);
		}

		replay() {
			return this._data.slice();
		}
	};

}());