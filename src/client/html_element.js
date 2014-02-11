// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global $, jQuery, TouchList, Touch */

(function() {
	"use strict";

	var browser = require("./browser.js");

	var capturedElement = null;


	/* Constructors */

	var HtmlElement = module.exports = function(domElement) {
		var self = this;

		self._domElement = domElement;
		self._element = $(domElement);
	};

	HtmlElement.fromHtml = function(html) {
		return new HtmlElement($(html)[0]);
	};


	/* Capture API */

	HtmlElement.prototype.setCapture = function() {
		capturedElement = this;
		this._domElement.setCapture();
	};

	HtmlElement.prototype.releaseCapture = function() {
		capturedElement = null;
		this._domElement.releaseCapture();
	};


	/* General event handling */

	HtmlElement.prototype.removeAllEventHandlers = function() {
		this._element.off();
	};


	/* Mouse events */
	createMouseMethods("Click", "click");
	createMouseMethods("Down", "mousedown");
	createMouseMethods("Move", "mousemove");
	createMouseMethods("Leave", "mouseleave");
	createMouseMethods("Up", "mouseup");

	function createMouseMethods(methodName, eventname) {
		HtmlElement.prototype["triggerMouse" + methodName] = triggerMouseEventFn(eventname);
		HtmlElement.prototype["onMouse" + methodName] = onMouseEventFn(eventname);
	}

	HtmlElement.prototype.triggerSelectStart = triggerMouseEventFn("selectstart");
	HtmlElement.prototype.onSelectStart_ie8Only = onMouseEventFn("selectstart");

	function triggerMouseEventFn(event) {
		return function(relativeX, relativeY) {
			var targetElement = capturedElement || this;

			var pageCoords;
			if (relativeX === undefined || relativeY === undefined) {
				pageCoords = { x: 0, y: 0 };
			}
			else {
				pageCoords = pageOffset(this, relativeX, relativeY);
			}

			sendMouseEvent(targetElement, event, pageCoords);
		};
	}

	function sendMouseEvent(self, event, pageCoords) {
		var jqElement = self._element;

		var eventData = new jQuery.Event();
		eventData.pageX = pageCoords.x;
		eventData.pageY = pageCoords.y;
		eventData.type = event;
		jqElement.trigger(eventData);
	}

	function onMouseEventFn(event) {
		return function(callback) {
			if (browser.doesNotHandlesUserEventsOnWindow() && this._domElement === window) return;

			this._element.on(event, mouseEventHandlerFn(this, callback));
		};
	}

	function mouseEventHandlerFn(self, callback) {
		return function(event) {
			var pageOffset = { x: event.pageX, y: event.pageY };
			callback(pageOffset, event);
		};
	}


	/* Touch events */

	HtmlElement.prototype.triggerSingleTouchStart = triggerSingleTouchEventFn("touchstart");
	HtmlElement.prototype.onSingleTouchStart = onSingleTouchEventFn("touchstart");

	HtmlElement.prototype.triggerSingleTouchMove = triggerSingleTouchEventFn("touchmove");
	HtmlElement.prototype.onSingleTouchMove = onSingleTouchEventFn("touchmove");

	HtmlElement.prototype.triggerMultiTouchStart = triggerMultiTouchEventFn("touchstart");
	HtmlElement.prototype.onMultiTouchStart = onMultiTouchEventFn("touchstart");

	HtmlElement.prototype.triggerTouchEnd = function() {
		sendTouchEvent(this, "touchend", new TouchList());
	};

	HtmlElement.prototype.triggerTouchCancel = function() {
		sendTouchEvent(this, "touchcancel", new TouchList());
	};

	HtmlElement.prototype.onTouchEnd = function(callback) {
		this._element.on("touchend", function() {
			callback();
		});
	};

	HtmlElement.prototype.onTouchCancel = function(callback) {
		this._element.on("touchcancel", function() {
			callback();
		});
	};

	function triggerSingleTouchEventFn(event) {
		return function(relativeX, relativeY) {
			sendSingleTouchEvent(this, event, relativeX, relativeY);
		};
	}

	function sendSingleTouchEvent(self, event, relativeX, relativeY) {
		var touch = createTouch(self, relativeX, relativeY);
		sendTouchEvent(self, event, new TouchList(touch));
	}

	function triggerMultiTouchEventFn(event) {
		return function(relative1X, relative1Y, relative2X, relative2Y) {
			sendMultiTouchEvent(this, event, relative1X, relative1Y, relative2X, relative2Y);
		};
	}

	function sendMultiTouchEvent(self, event, relative1X, relative1Y, relative2X, relative2Y) {
		var touch1 = createTouch(self, relative1X, relative1Y);
		var touch2 = createTouch(self, relative2X, relative2Y);
		sendTouchEvent(self, event, new TouchList(touch1, touch2));
	}

	function onSingleTouchEventFn(event) {
		return function(callback) {
			this._element.on(event, oneTouchEventHandlerFn(this, callback));
		};
	}

	function onMultiTouchEventFn(event) {
		return function(callback) {
			var self = this;
			this._element.on(event, function(event) {
				var originalEvent = event.originalEvent;
				if (originalEvent.touches.length !== 1) callback();
			});
		};
	}

	function oneTouchEventHandlerFn(self, callback) {
		return function(event) {
			var originalEvent = event.originalEvent;
			if (originalEvent.touches.length !== 1) return;

			var pageX = originalEvent.touches[0].pageX;
			var pageY = originalEvent.touches[0].pageY;
			var offset = { x: pageX, y: pageY };

			callback(offset, event);
		};
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
		self._element.trigger(eventData);
	}

	function createTouch(self, relativeX, relativeY) {
		var offset = pageOffset(self, relativeX, relativeY);

		var target = self._element[0];
		var identifier = 0;
		var pageX = offset.x;
		var pageY = offset.y;
		var screenX = 0;
		var screenY = 0;

		return new Touch(undefined, target, identifier, pageX, pageY, screenX, screenY);
	}


	/* Offsets and positioning */

	HtmlElement.prototype.relativeOffset = function(pageOffset) {
		return relativeOffset(this, pageOffset.x, pageOffset.y);
	};

	HtmlElement.prototype.pageOffset = function(relativeOffset) {
		return pageOffset(this, relativeOffset.x, relativeOffset.y);
	};

	function relativeOffset(self, pageX, pageY) {
		var pageOffset = self._element.offset();

		return {
			x: pageX - pageOffset.left,
			y: pageY - pageOffset.top
		};
	}

	function pageOffset(self, relativeX, relativeY) {
		var topLeftOfDrawingArea = self._element.offset();
		return {
			x: relativeX + topLeftOfDrawingArea.left,
			y: relativeY + topLeftOfDrawingArea.top
		};
	}


	/* DOM Manipulation */

	HtmlElement.prototype.append = function(elementToAppend) {
		this._element.append(elementToAppend._element);
	};

	HtmlElement.prototype.appendSelfToBody = function() {
		$(document.body).append(this._element);
	};

	HtmlElement.prototype.remove = function() {
		this._element.remove();
	};

	HtmlElement.prototype.toDomElement = function() {
		return this._element[0];
	};

}());