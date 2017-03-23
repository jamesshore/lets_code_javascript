// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var EventRepository = module.exports = function EventRepository() {
		this._data = [];
	};

	EventRepository.prototype.store = function(event) {
		this._data.push(event);
	};

	EventRepository.prototype.replay = function() {
		return this._data;
	};

}());