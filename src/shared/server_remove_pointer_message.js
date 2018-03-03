// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ServerRemovePointerMessage = module.exports = function(clientId) {
		this.id = clientId;
	};

	ServerRemovePointerMessage.MESSAGE_NAME = "server_remove_pointer_event";
	ServerRemovePointerMessage.prototype.name = function() { return ServerRemovePointerMessage.MESSAGE_NAME; };

	ServerRemovePointerMessage.fromPayload = function(obj) {
		return new ServerRemovePointerMessage(obj.id);
	};

	ServerRemovePointerMessage.prototype.payload = function() {
		return { id: this.id };
	};

}());