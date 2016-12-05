// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ServerDrawEvent = require("./server_draw_event.js");

	var ClientDrawEvent = module.exports = function(fromX, fromY, toX, toY) {
		this._data = {
			fromX: fromX,
			fromY: fromY,
			toX: toX,
			toY: toY
		};
	};

	ClientDrawEvent.EVENT_NAME = "client_line_event";

	ClientDrawEvent.fromSerializableObject = function(obj) {
		return new ClientDrawEvent(obj.fromX, obj.fromY, obj.toX, obj.toY);
	};

	ClientDrawEvent.prototype.toSerializableObject = function() {
		return this._data;
	};

	ClientDrawEvent.prototype.toServerEvent = function() {
		return new ServerDrawEvent(this._data.fromX, this._data.fromY, this._data.toX, this._data.toY);
	};

}());