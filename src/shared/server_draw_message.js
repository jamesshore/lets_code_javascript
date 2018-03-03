// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ServerDrawMessage = module.exports = function(fromX, fromY, toX, toY) {
		this.from = {
			x: fromX,
			y: fromY
		};
		this.to = {
			x: toX,
			y: toY
		};
	};

	ServerDrawMessage.EVENT_NAME = "server_draw_event";
	ServerDrawMessage.prototype.name = function() { return ServerDrawMessage.EVENT_NAME; };

	ServerDrawMessage.fromPayload = function(obj) {
		return new ServerDrawMessage(obj.fromX, obj.fromY, obj.toX, obj.toY);
	};

	ServerDrawMessage.prototype.payload = function() {
		return {
			fromX: this.from.x,
			fromY: this.from.y,
			toX: this.to.x,
			toY: this.to.y
		};
	};

}());