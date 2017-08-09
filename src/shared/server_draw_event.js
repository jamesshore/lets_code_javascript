// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var ServerDrawEvent = module.exports = function(fromX, fromY, toX, toY) {
		this.from = {
			x: fromX,
			y: fromY
		};
		this.to = {
			x: toX,
			y: toY
		};
	};

	ServerDrawEvent.EVENT_NAME = "server_draw_event";
	ServerDrawEvent.prototype.name = function() { return ServerDrawEvent.EVENT_NAME; };

	ServerDrawEvent.fromPayload = function(obj) {
		return new ServerDrawEvent(obj.fromX, obj.fromY, obj.toX, obj.toY);
	};

	ServerDrawEvent.prototype.payload = function() {
		return {
			fromX: this.from.x,
			fromY: this.from.y,
			toX: this.to.x,
			toY: this.to.y
		};
	};

}());