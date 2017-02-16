// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ServerClearScreenEvent = require("./server_clear_screen_event.js");

	var ClientClearScreenEvent = module.exports = function() {
	};

	ClientClearScreenEvent.EVENT_NAME = "client_clear_screen_event";
	ClientClearScreenEvent.prototype.name = function() { return ClientClearScreenEvent.EVENT_NAME; };

	ClientClearScreenEvent.fromSerializableObject = function(obj) {
		return new ClientClearScreenEvent();
	};

	ClientClearScreenEvent.prototype.toSerializableObject = function() {
		return {};
	};

	ClientClearScreenEvent.prototype.toServerEvent = function() {
		return new ServerClearScreenEvent();
	};

}());