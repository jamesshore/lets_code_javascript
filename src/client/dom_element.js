// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global wwp:true, $, jQuery, TouchList, Touch */

window.wwp = window.wwp || {};

(function() {
	"use strict";

	var DomElement = wwp.DomElement = function(jqueryElement) {
		this.element = jqueryElement;
	};

	DomElement.prototype.doSelectStart = function(relativeX, relativeY) {
		sendMouseEvent(this, "selectstart", relativeX, relativeY);
	};

	DomElement.prototype.doMouseDown = function(relativeX, relativeY) {
		sendMouseEvent(this, "mousedown", relativeX, relativeY);
	};

	DomElement.prototype.doMouseMove = function(relativeX, relativeY) {
		sendMouseEvent(this, "mousemove", relativeX, relativeY);
	};

	DomElement.prototype.doMouseLeave = function(relativeX, relativeY) {
		sendMouseEvent(this, "mouseleave", relativeX, relativeY);
	};

	DomElement.prototype.doMouseUp = function(relativeX, relativeY) {
		sendMouseEvent(this, "mouseup", relativeX, relativeY);
	};

	DomElement.prototype.doSingleTouchStart = function(relativeX, relativeY) {
		sendSingleTouchEvent(this, "touchstart", relativeX, relativeY);
	};

	DomElement.prototype.doSingleTouchMove = function(relativeX, relativeY) {
		sendSingleTouchEvent(this, "touchmove", relativeX, relativeY);
	};

	DomElement.prototype.doSingleTouchEnd = function(relativeX, relativeY) {
		sendSingleTouchEvent(this, "touchend", relativeX, relativeY);
	};

	DomElement.prototype.doSingleTouchCancel = function(relativeX, relativeY) {
		sendSingleTouchEvent(this, "touchcancel", relativeX, relativeY);
	};

	DomElement.prototype.doMultiTouchStart = function(relative1X, relative1Y, relative2X, relative2Y) {
		sendMultiTouchEvent(this, "touchstart", relative1X, relative1Y, relative2X, relative2Y);
	};

	DomElement.prototype.doMultiTouchMove = function(relative1X, relative1Y, relative2X, relative2Y) {
		sendMultiTouchEvent(this, "touchmove", relative1X, relative1Y, relative2X, relative2Y);
	};

	DomElement.prototype.doMultiTouchEnd = function(relative1X, relative1Y, relative2X, relative2Y) {
		sendMultiTouchEvent(this, "touchend", relative1X, relative1Y, relative2X, relative2Y);
	};

	DomElement.prototype.onSelectStart_ie8Only = function(callback) {
		this.element.on("selectstart", mouseEventHandlerFn(this, callback));
	};

	DomElement.prototype.onMouseDown = function(callback) {
		this.element.mousedown(mouseEventHandlerFn(this, callback));
	};

	DomElement.prototype.onMouseMove = function(callback) {
		var self = this;
		this.element.mousemove(mouseEventHandlerFn(this, callback));
	};

	DomElement.prototype.onMouseLeave = function(callback) {
		this.element.mouseleave(mouseEventHandlerFn(this, callback));
	};

	DomElement.prototype.onMouseUp = function(callback) {
		this.element.mouseup(mouseEventHandlerFn(this, callback));
	};

	DomElement.prototype.onSingleTouchStart = function(callback) {
		this.element.on("touchstart", oneTouchEventHandlerFn(this, callback));
	};

	DomElement.prototype.onSingleTouchMove = function(callback) {
		this.element.on("touchmove", oneTouchEventHandlerFn(this, callback));
	};

	DomElement.prototype.onSingleTouchEnd = function(callback) {
		this.element.on("touchend", oneTouchEventHandlerFn(this, callback));
	};

	DomElement.prototype.onSingleTouchCancel = function(callback) {
		this.element.on("touchcancel", oneTouchEventHandlerFn(this, callback));
	};

	DomElement.prototype.onMultiTouchStart = function(callback) {
		var self = this;
		this.element.on("touchstart", function(event) {
			var originalEvent = event.originalEvent;
			if (originalEvent.touches.length !== 1) callback();
		});
	};

	function mouseEventHandlerFn(self, callback) {
		return function(event) {
			var offset = relativeOffset(self, event.pageX, event.pageY);
			callback(offset, event);
		};
	}

	function oneTouchEventHandlerFn(self, callback) {
		return function(event) {
			var originalEvent = event.originalEvent;
			if (originalEvent.touches.length !== 1) return;

			var pageX = originalEvent.touches[0].pageX;
			var pageY = originalEvent.touches[0].pageY;
			var offset = relativeOffset(self, pageX, pageY);

			callback(offset, event);
		};
	}

	function sendMouseEvent(self, event, relativeX, relativeY) {
		var jqElement = self.element;

		var page = pageOffset(self, relativeX, relativeY);
		var eventData = new jQuery.Event();
		eventData.pageX = page.x;
		eventData.pageY = page.y;
		eventData.type = event;
		jqElement.trigger(eventData);
	}

	function sendSingleTouchEvent(self, event, relativeX, relativeY) {
		var touch = createTouch(self, relativeX, relativeY);
		sendTouchEvent(self, event, new TouchList(touch));
	}

	function sendMultiTouchEvent(self, event, relative1X, relative1Y, relative2X, relative2Y) {
		var touch1 = createTouch(self, relative1X, relative1Y);
		var touch2 = createTouch(self, relative2X, relative2Y);
		sendTouchEvent(self, event, new TouchList(touch1, touch2));
	}

	function sendTouchEvent(self, event, touchList) {
		var touchEvent = document.createEvent("TouchEvent");
		touchEvent.initTouchEvent(
			event, // event type
			true, // canBubble
			true, // cancelable
			window, // DOM window
			null, // detail (not sure what this is)
			0, 0, // screenX/Y
			0, 0, // clientX/Y
			false, false, false, false, // meta keys (shift etc.)
			touchList, touchList, touchList
		);

		var eventData = new jQuery.Event("event");
		eventData.type = event;
		eventData.originalEvent = touchEvent;
		self.element.trigger(eventData);
	}

	function createTouch(self, relativeX, relativeY) {
		var offset = pageOffset(self, relativeX, relativeY);

		var target = self.element[0];
		var identifier = 0;
		var pageX = offset.x;
		var pageY = offset.y;
		var screenX = 0;
		var screenY = 0;

		return new Touch(undefined, target, identifier, pageX, pageY, screenX, screenY);
	}

	function relativeOffset(self, pageX, pageY) {
		var pageOffset = self.element.offset();

		return {
			x: pageX - pageOffset.left,
			y: pageY - pageOffset.top
		};
	}

	function pageOffset(self, relativeX, relativeY) {
		var topLeftOfDrawingArea = self.element.offset();
		return {
			x: relativeX + topLeftOfDrawingArea.left,
			y: relativeY + topLeftOfDrawingArea.top
		};
	}

}());