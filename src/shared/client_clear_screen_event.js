// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	// var ServerDrawEvent = require("./server_draw_event.js");

	var ClientClearScreenEvent = module.exports = function() {
		// this._data = {
		// 	fromX: fromX,
		// 	fromY: fromY,
		// 	toX: toX,
		// 	toY: toY
		// };
	};

	// ClientDrawEvent.EVENT_NAME = "client_line_event";
	// ClientDrawEvent.prototype.name = function() { return ClientDrawEvent.EVENT_NAME; };
	//
	ClientClearScreenEvent.fromSerializableObject = function(obj) {
		return new ClientClearScreenEvent();
	};

	ClientClearScreenEvent.prototype.toSerializableObject = function() {
		return {};
	};

	// ClientDrawEvent.prototype.toServerEvent = function() {
	// 	return new ServerDrawEvent(this._data.fromX, this._data.fromY, this._data.toX, this._data.toY);
	// };

}());