// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global wwp:true, $, jQuery, TouchList, Touch */

window.wwp = window.wwp || {};

(function() {
	"use strict";

	var DomElement = wwp.DomElement = function(jqueryElement) {
		this.element = jqueryElement;
	};

	DomElement.prototype.selectStart = function(relativeX, relativeY) {
		sendMouseEvent(this, "selectstart", relativeX, relativeY);
	};

	DomElement.prototype.mouseDown = function(relativeX, relativeY) {
		sendMouseEvent(this, "mousedown", relativeX, relativeY);
	};

	DomElement.prototype.mouseMove = function(relativeX, relativeY) {
		sendMouseEvent(this, "mousemove", relativeX, relativeY);
	};

	DomElement.prototype.mouseLeave = function(relativeX, relativeY) {
		sendMouseEvent(this, "mouseleave", relativeX, relativeY);
	};

	DomElement.prototype.mouseUp = function(relativeX, relativeY) {
		sendMouseEvent(this, "mouseup", relativeX, relativeY);
	};


	DomElement.prototype.touchStart = function(relativeX, relativeY) {
		sendSingleTouchEvent(this, "touchstart", relativeX, relativeY);
	};

	DomElement.prototype.touchMove = function(relativeX, relativeY) {
		sendSingleTouchEvent(this, "touchmove", relativeX, relativeY);
	};

	DomElement.prototype.touchEnd = function(relativeX, relativeY) {
		sendSingleTouchEvent(this, "touchend", relativeX, relativeY);
	};

	DomElement.prototype.touchCancel = function(relativeX, relativeY) {
		sendSingleTouchEvent(this, "touchcancel", relativeX, relativeY);
	};


	DomElement.prototype.multipleTouchStart = function(relative1X, relative1Y, relative2X, relative2Y) {
		sendMultiTouchEvent(this, "touchstart", relative1X, relative1Y, relative2X, relative2Y);
	};

	DomElement.prototype.multipleTouchMove = function(relative1X, relative1Y, relative2X, relative2Y) {
		sendMultiTouchEvent(this, "touchmove", relative1X, relative1Y, relative2X, relative2Y);
	};

	DomElement.prototype.multipleTouchEnd = function(relative1X, relative1Y, relative2X, relative2Y) {
		sendMultiTouchEvent(this, "touchend", relative1X, relative1Y, relative2X, relative2Y);
	};



	function sendMultiTouchEvent(self, event, relative1X, relative1Y, relative2X, relative2Y) {
		var touch1 = createTouch(self, self.pageOffset(relative1X, relative1Y));
		var touch2 = createTouch(self, self.pageOffset(relative2X, relative2Y));
		sendTouchEvent(self, event, createTouchList(touch1, touch2));
	}


	function createTouchList(touchA, touchB) {
		if (touchB === null) return new TouchList(touchA);
		else return new TouchList(touchA, touchB);
	}



	function sendMouseEvent(self, event, relativeX, relativeY) {
		var jqElement = self.element;

		var page = self.pageOffset(relativeX, relativeY);
		var eventData = new jQuery.Event();
		eventData.pageX = page.x;
		eventData.pageY = page.y;
		eventData.type = event;
		jqElement.trigger(eventData);
	}

	function sendSingleTouchEvent(self, event, relativeX, relativeY) {
		var touch = createTouch(self, self.pageOffset(relativeX, relativeY));
		sendTouchEvent(self, event, new TouchList(touch));
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

	function createTouch(self, pageOffset) {
		var target = self.element[0];
		var identifier = 0;
		var pageX = pageOffset.x;
		var pageY = pageOffset.y;
		var screenX = 0;
		var screenY = 0;

		var touch = new Touch(undefined, target, identifier, pageX, pageY, screenX, screenY);
		return touch;
	}



	DomElement.prototype.onSelectStart_ie8Only = function(callback) {
		this.element.on("selectstart", callback);
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

	DomElement.prototype.relativeOffset = function(pageX, pageY) {
		var pageOffset = this.element.offset();

		return {
			x: pageX - pageOffset.left,
			y: pageY - pageOffset.top
		};
	};

	DomElement.prototype.pageOffset = function(relativeX, relativeY) {
		var topLeftOfDrawingArea = this.element.offset();
		return {
			x: relativeX + topLeftOfDrawingArea.left,
			y: relativeY + topLeftOfDrawingArea.top
		};
	};

	function mouseEventHandlerFn(self, callback) {
		return function(event) {
			var offset = self.relativeOffset(event.pageX, event.pageY);
			callback(offset, event);
		};
	}

	function oneTouchEventHandlerFn(self, callback) {
		return function(event) {
			var originalEvent = event.originalEvent;
			if (originalEvent.touches.length !== 1) return;

			var pageX = originalEvent.touches[0].pageX;
			var pageY = originalEvent.touches[0].pageY;
			var offset = self.relativeOffset(pageX, pageY);

			callback(offset, event);
		};
	}

}());