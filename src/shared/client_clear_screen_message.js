// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ServerClearScreenMessage = require("./server_clear_screen_message.js");

	var ClientClearScreenMessage = module.exports = function() {
	};

	ClientClearScreenMessage.MESSAGE_NAME = "client_clear_screen_message";
	ClientClearScreenMessage.prototype.name = function() { return ClientClearScreenMessage.MESSAGE_NAME; };

	ClientClearScreenMessage.fromPayload = function(obj) {
		return new ClientClearScreenMessage();
	};

	ClientClearScreenMessage.prototype.payload = function() {
		return {};
	};

	ClientClearScreenMessage.prototype.toServerMessage = function() {
		return new ServerClearScreenMessage();
	};

}());