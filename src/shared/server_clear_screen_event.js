// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ServerClearScreenEvent = module.exports = function() {
	};

	ServerClearScreenEvent.EVENT_NAME = "server_clear_screen_event";
	ServerClearScreenEvent.prototype.name = function() { return ServerClearScreenEvent.EVENT_NAME; };

	ServerClearScreenEvent.fromSerializableObject = function(obj) {
		return new ServerClearScreenEvent();
	};

	ServerClearScreenEvent.prototype.payload = function() {
		return {};
	};

}());