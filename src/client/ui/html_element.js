// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global $, jQuery */

(function() {
	"use strict";

	var browser = require("./browser.js");
	var failFast = require("../../shared/fail_fast.js");


	/* Constructors */

	var HtmlElement = module.exports = function(domElement) {
		var self = this;

		self._domElement = domElement;
		self._element = $(domElement);
		self._dragDefaultsPrevented = false;
	};

	HtmlElement.fromHtml = function(html) {
		return new HtmlElement($(html)[0]);
	};

	HtmlElement.fromId = function(id) {
		var domElement = document.getElementById(id);
		failFast.unlessTrue(domElement !== null, "could not find element with id '" + id + "'");
		return new HtmlElement(domElement);
	};


	/* General event handling */

	HtmlElement.prototype.removeAllEventHandlers = function() {
		this._element.off();
	};

	HtmlElement.prototype.preventBrowserDragDefaults = function() {
		this._element.on("selectstart", preventDefaults);
		this._element.on("mousedown", preventDefaults);
		this._element.on("touchstart", preventDefaults);

		this._dragDefaultsPrevented = true;

		function preventDefaults(event) {
			event.preventDefault();
		}
	};

	HtmlElement.prototype.isBrowserDragDefaultsPrevented = function() {
		return this._dragDefaultsPrevented;
	};

	/* Mouse events */
	HtmlElement.prototype.triggerMouseClick = triggerMouseEventFn("click");
	HtmlElement.prototype.triggerMouseDown = triggerMouseEventFn("mousedown");
	HtmlElement.prototype.triggerMouseMove = triggerMouseEventFn("mousemove");
	HtmlElement.prototype.triggerMouseLeave = triggerMouseEventFn("mouseleave");
	HtmlElement.prototype.triggerMouseUp = triggerMouseEventFn("mouseup");

	HtmlElement.prototype.onMouseClick = onMouseEventFn("click");
	HtmlElement.prototype.onMouseDown = onMouseEventFn("mousedown");
	HtmlElement.prototype.onMouseMove = onMouseEventFn("mousemove");
	HtmlElement.prototype.onMouseLeave = onMouseEventFn("mouseleave");
	HtmlElement.prototype.onMouseUp = onMouseEventFn("mouseup");

	function triggerMouseEventFn(event) {
		return function(relativeX, relativeY) {
			var pageCoords;
			if (relativeX === undefined || relativeY === undefined) {
				pageCoords = { x: 0, y: 0 };
			}
			else {
				pageCoords = pageOffset(this, relativeX, relativeY);
			}

			sendMouseEvent(this, event, pageCoords);
		};
	}

	function onMouseEventFn(event) {
		return function(callback) {
			this._element.on(event, function(event) {
				var pageOffset = { x: event.pageX, y: event.pageY };
				callback(pageOffset);
			});
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


	/* Touch events */

	HtmlElement.prototype.triggerTouchEnd = triggerZeroTouchEventFn("touchend");
	HtmlElement.prototype.triggerTouchCancel = triggerZeroTouchEventFn("touchcancel");
	HtmlElement.prototype.triggerSingleTouchStart = triggerSingleTouchEventFn("touchstart");
	HtmlElement.prototype.triggerSingleTouchMove = triggerSingleTouchEventFn("touchmove");
	HtmlElement.prototype.triggerMultiTouchStart = triggerMultiTouchEventFn("touchstart");

	HtmlElement.prototype.onTouchEnd = onZeroTouchEventFn("touchend");
	HtmlElement.prototype.onTouchCancel = onZeroTouchEventFn("touchcancel");
	HtmlElement.prototype.onSingleTouchStart = onSingleTouchEventFn("touchstart");
	HtmlElement.prototype.onSingleTouchMove = onSingleTouchEventFn("touchmove");
	HtmlElement.prototype.onMultiTouchStart = onMultiTouchEventFn("touchstart");

	function triggerZeroTouchEventFn(event) {
		return function() {
			sendTouchEvent(this, event, document.createTouchList());
		};
	}

	function triggerSingleTouchEventFn(event) {
		return function(relativeX, relativeY) {
			var touch = createTouch(this, relativeX, relativeY);
			sendTouchEvent(this, event, document.createTouchList(touch));
		};
	}

	function triggerMultiTouchEventFn(event) {
		return function(relative1X, relative1Y, relative2X, relative2Y) {
			var touch1 = createTouch(this, relative1X, relative1Y);
			var touch2 = createTouch(this, relative2X, relative2Y);
			sendTouchEvent(this, event, document.createTouchList(touch1, touch2));
		};
	}


	function onZeroTouchEventFn(event) {
		return function(callback) {
			this._element.on(event, function() {
				callback();
			});
		};
	}

	function onSingleTouchEventFn(eventName) {
		return function(callback) {
			this._element.on(eventName, function(event) {
				var originalEvent = event.originalEvent;
				if (originalEvent.touches.length !== 1) return;

				var pageX = originalEvent.touches[0].pageX;
				var pageY = originalEvent.touches[0].pageY;
				var offset = { x: pageX, y: pageY };

				callback(offset);
			});
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

	function sendTouchEvent(self, eventType, touchList) {
		var touchEvent = document.createEvent("TouchEvent");

		var canBubble = true;
		var cancelable = true;
		var view = window;
		var detail = null;    // not sure what this is
		var screenX = 0;
		var screenY = 0;
		var clientX = 0;
		var clientY = 0;
		var ctrlKey = false;
		var altKey = false;
		var shiftKey = false;
		var metaKey = false;
		var touches = touchList;
		var targetTouches = touchList;
		var changedTouches = touchList;
		var scale = 1;
		var rotation = 0;

		if (browser.usesAndroidInitTouchEventParameterOrder()) {
			touchEvent.initTouchEvent(
				touches, targetTouches, changedTouches,
				eventType,
				view,
				screenX, screenY,
				clientX, clientY,
				ctrlKey, altKey, shiftKey, metaKey
			);
		}
		else {
			touchEvent.initTouchEvent(
				eventType,
				canBubble,
				cancelable,
				view,
				detail,
				screenX, screenY,
				clientX, clientY,
				ctrlKey, altKey, shiftKey, metaKey,
				touches, targetTouches, changedTouches,
				scale, rotation
			);
		}

		var eventData = new jQuery.Event("event");
		eventData.type = eventType;
		eventData.originalEvent = touchEvent;
		self._element.trigger(eventData);
	}

	function createTouch(self, relativeX, relativeY) {
		var offset = pageOffset(self, relativeX, relativeY);

		var view = window;
		var target = self._element[0];
		var identifier = 0;
		var pageX = offset.x;
		var pageY = offset.y;
		var screenX = 0;
		var screenY = 0;

		return document.createTouch(view, target, identifier, pageX, pageY, screenX, screenY);
	}


	/* Dimensions, offsets, and positioning */

	HtmlElement.prototype.getDimensions = function() {
		return {
			width: this._element.width(),
			height: this._element.height()
		};
	};

	HtmlElement.prototype.relativeOffset = function(pageOffset) {
		return relativeOffset(this, pageOffset.x, pageOffset.y);
	};

	HtmlElement.prototype.pageOffset = function(relativeOffset) {
		return pageOffset(this, relativeOffset.x, relativeOffset.y);
	};

	function relativeOffset(self, pageX, pageY) {
		failFastIfStylingPresent(self);

		var pageOffset = self._element.offset();
		return {
			x: pageX - pageOffset.left,
			y: pageY - pageOffset.top
		};
	}

	function pageOffset(self, relativeX, relativeY) {
		failFastIfStylingPresent(self);

		var topLeftOfDrawingArea = self._element.offset();
		return {
			x: relativeX + topLeftOfDrawingArea.left,
			y: relativeY + topLeftOfDrawingArea.top
		};
	}

	function failFastIfStylingPresent(self) {
		failFastIfPaddingPresent("top");
		failFastIfPaddingPresent("left");
		failFastIfBorderPresent("top");
		failFastIfBorderPresent("left");

		function failFastIfPaddingPresent(side) {
			var css = self._element.css("padding-" + side);
			if (css !== "0px") throw new Error("Do not apply padding to elements used with relativeOffset() (expected 0px but was " + css + ")");
		}

		function failFastIfBorderPresent(side) {
			var css = self._element.css("border-" + side + "-width");
			if (css !== "0px") throw new Error("Do not apply border to elements used with relativeOffset() (expected 0px but was " + css + ")");
		}
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