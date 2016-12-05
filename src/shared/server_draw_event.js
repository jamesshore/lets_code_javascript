// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ServerDrawEvent = module.exports = function(fromX, fromY, toX, toY) {
		this._data = {
			fromX: fromX,
			fromY: fromY,
			toX: toX,
			toY: toY
		};
	};

	ServerDrawEvent.EVENT_NAME = "server_draw_event";

	ServerDrawEvent.fromSerializableObject = function(obj) {
		return new ServerDrawEvent(obj.fromX, obj.fromY, obj.toX, obj.toY);
	};

	ServerDrawEvent.prototype.toSerializableObject = function toSerializableObject() {
		return this._data;
	};

}());