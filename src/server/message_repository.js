// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	module.exports = class MessageRepository {
		constructor() {
			this._data = [];
		}

		store(message) {
			this._data.push(message);
		}

		replay() {
			return this._data.slice();
		}
	};

}());