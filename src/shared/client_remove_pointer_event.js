// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ServerRemovePointerEvent = require("./server_remove_pointer_event.js");

	var ClientRemovePointerEvent = module.exports = function() {
	};

	ClientRemovePointerEvent.EVENT_NAME = "client_remove_pointer_event";
	ClientRemovePointerEvent.prototype.name = function() { return ClientRemovePointerEvent.EVENT_NAME; };

	ClientRemovePointerEvent.fromSerializableObject = function(obj) {
		return new ClientRemovePointerEvent();
	};

	ClientRemovePointerEvent.prototype.toSerializableObject = function() {
		return {};
	};

	ClientRemovePointerEvent.prototype.toServerEvent = function(clientId) {
		return new ServerRemovePointerEvent(clientId);
	};

}());