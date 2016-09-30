// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ServerPointerEvent = require("./server_pointer_event.js");

	var ClientPointerEvent = module.exports = function(x, y) {
		this._x = x;
		this._y = y;
	};

	ClientPointerEvent.EVENT_NAME = "client_pointer_event";

	ClientPointerEvent.fromSerializableObject = function(obj) {
		return new ClientPointerEvent(obj.x, obj.y);
	};

	ClientPointerEvent.prototype.toSerializableObject = function() {
		return {
			x: this._x,
			y: this._y
		};
	};

	ClientPointerEvent.prototype.toServerEvent = function(id) {
		return new ServerPointerEvent(id, this._x, this._y);
	};

}());