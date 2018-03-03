// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ServerDrawMessage = require("./server_draw_message.js");

	var ClientDrawMessage = module.exports = function(fromX, fromY, toX, toY) {
		this._data = {
			fromX: fromX,
			fromY: fromY,
			toX: toX,
			toY: toY
		};
	};

	ClientDrawMessage.MESSAGE_NAME = "client_line_event";
	ClientDrawMessage.prototype.name = function() { return ClientDrawMessage.MESSAGE_NAME; };

	ClientDrawMessage.fromPayload = function(obj) {
		return new ClientDrawMessage(obj.fromX, obj.fromY, obj.toX, obj.toY);
	};

	ClientDrawMessage.prototype.payload = function() {
		return this._data;
	};

	ClientDrawMessage.prototype.toServerMessage = function() {
		return new ServerDrawMessage(this._data.fromX, this._data.fromY, this._data.toX, this._data.toY);
	};

}());