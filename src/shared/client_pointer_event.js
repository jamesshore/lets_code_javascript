// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ClientPointerEvent = module.exports = function ServerPointerEvent(x, y) {
		this.x = x;
		this.y = y;
	};

	ClientPointerEvent.EVENT_NAME = "client_pointer_event";

	ClientPointerEvent.fromSerializableObject = function fromSerializableObject(obj) {
		return new ClientPointerEvent(obj.x, obj.y);
	};

	ClientPointerEvent.prototype.toSerializableObject = function toSerializableObject() {
		return {
			x: this.x,
			y: this.y
		};
	};

}());