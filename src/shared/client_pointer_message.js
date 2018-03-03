// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ServerPointerMessage = require("./server_pointer_message.js");

	var ClientPointerMessage = module.exports = function(x, y) {
		this._x = x;
		this._y = y;
	};

	ClientPointerMessage.MESSAGE_NAME = "client_pointer_message";
	ClientPointerMessage.prototype.name = function() { return ClientPointerMessage.MESSAGE_NAME; };

	ClientPointerMessage.fromPayload = function(obj) {
		return new ClientPointerMessage(obj.x, obj.y);
	};

	ClientPointerMessage.prototype.payload = function() {
		return {
			x: this._x,
			y: this._y
		};
	};

	ClientPointerMessage.prototype.toServerMessage = function(id) {
		return new ServerPointerMessage(id, this._x, this._y);
	};

}());