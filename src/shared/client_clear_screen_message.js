// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ServerClearScreenMessage = require("./server_clear_screen_message.js");

	var ClientClearScreenMessage = module.exports = function() {
	};

	ClientClearScreenMessage.EVENT_NAME = "client_clear_screen_event";
	ClientClearScreenMessage.prototype.name = function() { return ClientClearScreenMessage.EVENT_NAME; };

	ClientClearScreenMessage.fromPayload = function(obj) {
		return new ClientClearScreenMessage();
	};

	ClientClearScreenMessage.prototype.payload = function() {
		return {};
	};

	ClientClearScreenMessage.prototype.toServerEvent = function() {
		return new ServerClearScreenMessage();
	};

}());