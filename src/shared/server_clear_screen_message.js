// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ServerClearScreenMessage = module.exports = function() {
	};

	ServerClearScreenMessage.MESSAGE_NAME = "server_clear_screen_event";
	ServerClearScreenMessage.prototype.name = function() { return ServerClearScreenMessage.MESSAGE_NAME; };

	ServerClearScreenMessage.fromPayload = function(obj) {
		return new ServerClearScreenMessage();
	};

	ServerClearScreenMessage.prototype.payload = function() {
		return {};
	};

}());