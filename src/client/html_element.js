// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global $, jQuery, TouchList, Touch */

(function() {
	"use strict";

	var HtmlElement = module.exports = function(domElement) {
		this._element = $(domElement);
	};

	HtmlElement.fromHtml = function(html) {
		return new HtmlElement($(html));
	};

	HtmlElement.prototype.onSelectStart_ie8Only = onMouseEventFn("selectstart");
	HtmlElement.prototype.onMouseDown = onMouseEventFn("mousedown");
	HtmlElement.prototype.onMouseMove = onMouseEventFn("mousemove");
	HtmlElement.prototype.onMouseLeave = onMouseEventFn("mouseleave");
	HtmlElement.prototype.onMouseUp = onMouseEventFn("mouseup");

	HtmlElement.prototype.doSelectStart = doMouseEventFn("selectstart");
	HtmlElement.prototype.doMouseDown = doMouseEventFn("mousedown");
	HtmlElement.prototype.doMouseMove = doMouseEventFn("mousemove");
	HtmlElement.prototype.doMouseLeave = doMouseEventFn("mouseleave");
	HtmlElement.prototype.doMouseUp = doMouseEventFn("mouseup");

	HtmlElement.prototype.onSingleTouchStart = onSingleTouchEventFn("touchstart");
	HtmlElement.prototype.onSingleTouchMove = onSingleTouchEventFn("touchmove");
	HtmlElement.prototype.onSingleTouchEnd = onSingleTouchEventFn("touchend");
	HtmlElement.prototype.onSingleTouchCancel = onSingleTouchEventFn("touchcancel");

	HtmlElement.prototype.doSingleTouchStart = doSingleTouchEventFn("touchstart");
	HtmlElement.prototype.doSingleTouchMove = doSingleTouchEventFn("touchmove");
	HtmlElement.prototype.doSingleTouchEnd = doSingleTouchEventFn("touchend");
	HtmlElement.prototype.doSingleTouchCancel = doSingleTouchEventFn("touchcancel");

	HtmlElement.prototype.onMultiTouchStart = onMultiTouchEventFn("touchstart");

	HtmlElement.prototype.doMultiTouchStart = doMultiTouchEventFn("touchstart");

	HtmlElement.prototype.removeAllEventHandlers = function() {
		this._element.off();
	};

	HtmlElement.prototype.relativeOffset = function(pageOffset) {
		return relativeOffset(this, pageOffset.x, pageOffset.y);
	};

	HtmlElement.prototype.pageOffset = function(relativeOffset) {
		return pageOffset(this, relativeOffset.x, relativeOffset.y);
	};

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

	function doMouseEventFn(event) {
		return function(relativeX, relativeY) {
			sendMouseEvent(this, event, relativeX, relativeY);
		};
	}

	function sendMouseEvent(self, event, relativeX, relativeY) {
		var jqElement = self._element;

		var page;
		if (relativeX === undefined || relativeY === undefined) {
			page = { x: 0, y: 0 };
		}
		else {
			page = pageOffset(self, relativeX, relativeY);
		}

		var eventData = new jQuery.Event();
		eventData.pageX = page.x;
		eventData.pageY = page.y;
		eventData.type = event;
		jqElement.trigger(eventData);
	}

	function doSingleTouchEventFn(event) {
		return function(relativeX, relativeY) {
			sendSingleTouchEvent(this, event, relativeX, relativeY);
		};
	}

	function sendSingleTouchEvent(self, event, relativeX, relativeY) {
		var touch = createTouch(self, relativeX, relativeY);
		sendTouchEvent(self, event, new TouchList(touch));
	}

	function doMultiTouchEventFn(event) {
		return function(relative1X, relative1Y, relative2X, relative2Y) {
			sendMultiTouchEvent(this, event, relative1X, relative1Y, relative2X, relative2Y);
		};
	}

	function sendMultiTouchEvent(self, event, relative1X, relative1Y, relative2X, relative2Y) {
		var touch1 = createTouch(self, relative1X, relative1Y);
		var touch2 = createTouch(self, relative2X, relative2Y);
		sendTouchEvent(self, event, new TouchList(touch1, touch2));
	}

	function onMouseEventFn(event) {
		return function(callback) {
			this._element.on(event, mouseEventHandlerFn(this, callback));
		};
	}

	function mouseEventHandlerFn(self, callback) {
		return function(event) {
			var pageOffset = { x: event.pageX, y: event.pageY };
			callback(pageOffset, event);
		};
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

	function relativeOffset(self, pageX, pageY) {
		console.log("X: " + pageX);
		console.log("Y: " + pageY);

		var pageOffset = self._element.offset();

		console.log("pageOffset", pageOffset);
		console.log("body", $(document.body).offset());
		console.log("offsetTop", self._element.offsetTop);

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

}());