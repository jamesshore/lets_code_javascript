// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ServerRemovePointerEvent = module.exports = function(clientId) {
		this.id = clientId;
	};

	ServerRemovePointerEvent.EVENT_NAME = "server_remove_pointer_event";
	ServerRemovePointerEvent.prototype.name = function() { return ServerRemovePointerEvent.EVENT_NAME; };

	ServerRemovePointerEvent.fromPayload = function(obj) {
		return new ServerRemovePointerEvent(obj.id);
	};

	ServerRemovePointerEvent.prototype.payload = function() {
		return { id: this.id };
	};

}());