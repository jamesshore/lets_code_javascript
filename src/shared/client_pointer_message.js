// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ServerPointerEvent = require("./server_pointer_event.js");

	var ClientPointerMessage = module.exports = function(x, y) {
		this._x = x;
		this._y = y;
	};

	ClientPointerMessage.EVENT_NAME = "client_pointer_event";
	ClientPointerMessage.prototype.name = function() { return ClientPointerMessage.EVENT_NAME; };

	ClientPointerMessage.fromPayload = function(obj) {
		return new ClientPointerMessage(obj.x, obj.y);
	};

	ClientPointerMessage.prototype.payload = function() {
		return {
			x: this._x,
			y: this._y
		};
	};

	ClientPointerMessage.prototype.toServerEvent = function(id) {
		return new ServerPointerEvent(id, this._x, this._y);
	};

}());