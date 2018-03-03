// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ServerPointerMessage = module.exports = function ServerPointerMessage(id, x, y) {
		this.id = id;
		this.x = x;
		this.y = y;
	};

	ServerPointerMessage.MESSAGE_NAME = "server_pointer_message";
	ServerPointerMessage.prototype.name = function() { return ServerPointerMessage.MESSAGE_NAME; };

	ServerPointerMessage.fromPayload = function(obj) {
		return new ServerPointerMessage(obj.id, obj.x, obj.y);
	};

	ServerPointerMessage.prototype.payload = function() {
		return {
			id: this.id,
			x: this.x,
			y: this.y
		};
	};

}());