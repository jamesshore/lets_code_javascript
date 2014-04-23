require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*global Modernizr, $ */

(function() {
	"use strict";

	exports.supportsTouchEvents = function() {
		return Modernizr.touch;
	};

	exports.supportsCaptureApi = function() {
		return document.body.setCapture && document.body.releaseCapture;
	};

	exports.reportsElementPositionOffByOneSometimes = function() {
		return isIe8();
	};

	exports.doesNotHandlesUserEventsOnWindow = function() {
		return isIe8();
	};

	exports.doesNotComputeStyles = function() {
		return isIe8();
	};

	function isIe8() {
		return $.browser.msie && $.browser.version === "8.0";
	}

}());
},{}],"JgRpWl":[function(require,module,exports){
// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global Raphael, $ */

(function() {
	"use strict";

	var SvgCanvas = require("./svg_canvas.js");
	var HtmlElement = require("./html_element.js");
	var browser = require("./browser.js");
	var failFast = require("./fail_fast.js");

	var svgCanvas = null;
	var start = null;
	var lineDrawn = false;
	var drawingArea;
	var clearScreenButton;
	var documentBody;
	var windowElement;
	var useSetCaptureApi = false;

	exports.initializeDrawingArea = function(elements) {
		if (svgCanvas !== null) throw new Error("Client.js is not re-entrant");

		drawingArea = elements.drawingAreaDiv;
		clearScreenButton = elements.clearScreenButton;

		failFast.unlessDefined(drawingArea, "elements.drawingArea");
		failFast.unlessDefined(clearScreenButton, "elements.clearScreenButton");

		documentBody = new HtmlElement(document.body);
		windowElement = new HtmlElement(window);

		svgCanvas = new SvgCanvas(drawingArea);

		drawingArea.preventBrowserDragDefaults();
		handleClearScreenClick();
		handleMouseDragEvents();
		handleTouchDragEvents();

		return svgCanvas;
	};

	exports.drawingAreaHasBeenRemovedFromDom = function() {
		svgCanvas = null;
	};

	function handleClearScreenClick() {
		clearScreenButton.onMouseClick(function() {
			svgCanvas.clear();
		});
	}

	function handleMouseDragEvents() {
		drawingArea.onMouseDown(startDrag);
		documentBody.onMouseMove(continueDrag);
		windowElement.onMouseUp(endDrag);

		if (browser.doesNotHandlesUserEventsOnWindow()) {
			drawingArea.onMouseUp(endDrag);
			useSetCaptureApi = true;
		}
	}

	function handleTouchDragEvents() {
		drawingArea.onSingleTouchStart(startDrag);
		drawingArea.onSingleTouchMove(continueDrag);
		drawingArea.onTouchEnd(endDrag);
		drawingArea.onTouchCancel(endDrag);

		drawingArea.onMultiTouchStart(endDrag);
	}

	function startDrag(pageOffset) {
		start = drawingArea.relativeOffset(pageOffset);
    if (useSetCaptureApi) drawingArea.setCapture();
	}

	function continueDrag(pageOffset) {
		if (!isCurrentlyDrawing()) return;

		var end = drawingArea.relativeOffset(pageOffset);
		if (start.x !== end.x || start.y !== end.y) {
			svgCanvas.drawLine(start.x, start.y, end.x, end.y);
			start = end;
			lineDrawn = true;
		}
	}

	function endDrag() {
		if (!isCurrentlyDrawing()) return;

		if (!lineDrawn) svgCanvas.drawDot(start.x, start.y);

		if (useSetCaptureApi) drawingArea.releaseCapture();
		start = null;
		lineDrawn = false;
	}

	function isCurrentlyDrawing() {
		return start !== null;
	}

}());
},{"./browser.js":1,"./fail_fast.js":4,"./html_element.js":"oNnxuL","./svg_canvas.js":7}],"./client.js":[function(require,module,exports){
module.exports=require('JgRpWl');
},{}],4:[function(require,module,exports){
// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
(function() {
	"use strict";

	exports.unlessDefined = function(variable, variableName) {
		variableName = variableName ? " [" + variableName + "] " : " ";
		if (variable === undefined) throw new FailFastException(exports.unlessDefined, "Required variable" + variableName + "was not defined");
	};

	exports.unlessTrue = function(variable, message) {
		if (message === undefined) message = "Expected condition to be true";

		if (variable === false) throw new FailFastException(exports.unlessTrue, message);
		if (variable !== true) throw new FailFastException(exports.unlessTrue, "Expected condition to be true or false");
	};

	exports.unreachable = function(message) {
		if (!message) message = "Unreachable code executed";

		throw new FailFastException(exports.unreachable, message);
	};

	var FailFastException = exports.FailFastException = function(fnToRemoveFromStackTrace, message) {
		if (Error.captureStackTrace) Error.captureStackTrace(this, fnToRemoveFromStackTrace);    // only works on Chrome/V8
		this.message = message;
	};
	FailFastException.prototype = new Error();
	FailFastException.prototype.constructor = FailFastException;
	FailFastException.prototype.name = "FailFastException";

}());
},{}],"oNnxuL":[function(require,module,exports){
// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global $, jQuery, TouchList, Touch */

(function() {
	"use strict";

	var browser = require("./browser.js");
	var failFast = require("./fail_fast.js");

	var capturedElement = null;


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

	function onMouseEventFn(event) {
		return function(callback) {
			if (browser.doesNotHandlesUserEventsOnWindow() && this._domElement === window) return;

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
			sendTouchEvent(this, event, new TouchList());
		};
	}

	function triggerSingleTouchEventFn(event) {
		return function(relativeX, relativeY) {
			var touch = createTouch(this, relativeX, relativeY);
			sendTouchEvent(this, event, new TouchList(touch));
		};
	}

	function triggerMultiTouchEventFn(event) {
		return function(relative1X, relative1Y, relative2X, relative2Y) {
			var touch1 = createTouch(this, relative1X, relative1Y);
			var touch2 = createTouch(this, relative2X, relative2Y);
			sendTouchEvent(this, event, new TouchList(touch1, touch2));
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
			if (css !== "0px") throw new Error("Do not apply padding to elements used with relativeOffset()");
		}

		function failFastIfBorderPresent(side) {
			var text = self._element.css("border-" + side + "-width");
			if (browser.doesNotComputeStyles()) {
				if (self._element.css("border-" + side + "-style") === "none") text = "0px";
			}

			if (text !== "0px") throw new Error("Do not apply border to elements used with relativeOffset()");
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
},{"./browser.js":1,"./fail_fast.js":4}],"./html_element.js":[function(require,module,exports){
module.exports=require('oNnxuL');
},{}],7:[function(require,module,exports){
// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*global Raphael */

(function() {
	"use strict";

	var SvgCanvas = module.exports = function(htmlElement) {
		var dimensions = htmlElement.getDimensions();
		this._paper = new Raphael(htmlElement.toDomElement(), dimensions.width, dimensions.height);
	};

	SvgCanvas.LINE_COLOR = "black";
	SvgCanvas.STROKE_WIDTH = 2;
	SvgCanvas.LINE_CAP = "round";

	SvgCanvas.prototype.clear = function() {
		this._paper.clear();
	};

	SvgCanvas.prototype.drawLine = function(startX, startY, endX, endY) {
		this._paper.path("M" + startX + "," + startY + "L" + endX + "," + endY)
			.attr({
				"stroke": SvgCanvas.LINE_COLOR,
				"stroke-width": SvgCanvas.STROKE_WIDTH,
				"stroke-linecap": SvgCanvas.LINE_CAP
			});
	};

	SvgCanvas.prototype.drawDot = function(x, y) {
		this._paper.circle(x, y, SvgCanvas.STROKE_WIDTH / 2)
			.attr({
				"stroke": SvgCanvas.LINE_COLOR,
				"fill": SvgCanvas.LINE_COLOR
			});
	};

	SvgCanvas.prototype.lineSegments = function() {
		var result = [];
		this._paper.forEach(function(element) {
			result.push(normalizeToLineSegment(element));
		});
		return result;
	};

	SvgCanvas.prototype.elementsForTestingOnly = function() {
		var result = [];
		this._paper.forEach(function(element) {
			result.push(element);
		});
		return result;
	};

	function normalizeToLineSegment(element) {
		switch (element.type) {
			case "path":
				return normalizePath(element);
			case "circle":
				return normalizeCircle(element);
			default:
				throw new Error("Unknown element type: " + element.type);
		}
	}

	function normalizeCircle(element) {
		return [
			element.attrs.cx,
			element.attrs.cy
		];
	}

	function normalizePath(element) {
		if (Raphael.svg) {
			return normalizeSvgPath(element);
		}
		else if (Raphael.vml) {
			return normalizeVmlPath(element);
		}
		else {
			throw new Error("Unknown Raphael rendering engine");
		}
	}

	function normalizeSvgPath(element) {
		var pathRegex;

		var path = element.node.attributes.d.value;
		if (path.indexOf(",") !== -1)
		// We're in Firefox, Safari, Chrome, which uses format "M20,30L30,300"
		{
			pathRegex = /M(\d+),(\d+)L(\d+),(\d+)/;
		}
		else {
			// We're in IE9, which uses format "M 20 30 L 30 300"
			pathRegex = /M (\d+) (\d+) L (\d+) (\d+)/;
		}
		var pathComponents = path.match(pathRegex);

		return [
			pathComponents[1],
			pathComponents[2],
			pathComponents[3],
			pathComponents[4]
		];
	}

	function normalizeVmlPath(element) {
		// We're in IE 8, which uses format "m432000,648000 l648000,67456800 e"
		var VML_MAGIC_NUMBER = 21600;

		var path = element.node.path.value;

		var ie8PathRegex = /m(\d+),(\d+) l(\d+),(\d+) e/;
		var ie8 = path.match(ie8PathRegex);

		var startX = ie8[1] / VML_MAGIC_NUMBER;
		var startY = ie8[2] / VML_MAGIC_NUMBER;
		var endX = ie8[3] / VML_MAGIC_NUMBER;
		var endY = ie8[4] / VML_MAGIC_NUMBER;

		return [
			startX,
			startY,
			endX,
			endY
		];
	}

}());
},{}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy93ZWV3aWtpcGFpbnQvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9qc2hvcmUvRG9jdW1lbnRzL1Byb2plY3RzL3dlZXdpa2lwYWludC9zcmMvY2xpZW50L2Jyb3dzZXIuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy93ZWV3aWtpcGFpbnQvc3JjL2NsaWVudC9jbGllbnQuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy93ZWV3aWtpcGFpbnQvc3JjL2NsaWVudC9mYWlsX2Zhc3QuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy93ZWV3aWtpcGFpbnQvc3JjL2NsaWVudC9odG1sX2VsZW1lbnQuanMiLCIvVXNlcnMvanNob3JlL0RvY3VtZW50cy9Qcm9qZWN0cy93ZWV3aWtpcGFpbnQvc3JjL2NsaWVudC9zdmdfY2FudmFzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTMgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIFNlZSBMSUNFTlNFLlRYVCBmb3IgZGV0YWlscy5cbi8qZ2xvYmFsIE1vZGVybml6ciwgJCAqL1xuXG4oZnVuY3Rpb24oKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXG5cdGV4cG9ydHMuc3VwcG9ydHNUb3VjaEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBNb2Rlcm5penIudG91Y2g7XG5cdH07XG5cblx0ZXhwb3J0cy5zdXBwb3J0c0NhcHR1cmVBcGkgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gZG9jdW1lbnQuYm9keS5zZXRDYXB0dXJlICYmIGRvY3VtZW50LmJvZHkucmVsZWFzZUNhcHR1cmU7XG5cdH07XG5cblx0ZXhwb3J0cy5yZXBvcnRzRWxlbWVudFBvc2l0aW9uT2ZmQnlPbmVTb21ldGltZXMgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gaXNJZTgoKTtcblx0fTtcblxuXHRleHBvcnRzLmRvZXNOb3RIYW5kbGVzVXNlckV2ZW50c09uV2luZG93ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIGlzSWU4KCk7XG5cdH07XG5cblx0ZXhwb3J0cy5kb2VzTm90Q29tcHV0ZVN0eWxlcyA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBpc0llOCgpO1xuXHR9O1xuXG5cdGZ1bmN0aW9uIGlzSWU4KCkge1xuXHRcdHJldHVybiAkLmJyb3dzZXIubXNpZSAmJiAkLmJyb3dzZXIudmVyc2lvbiA9PT0gXCI4LjBcIjtcblx0fVxuXG59KCkpOyIsIi8vIENvcHlyaWdodCAoYykgMjAxMiBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gU2VlIExJQ0VOU0UudHh0IGZvciBkZXRhaWxzLlxuLypnbG9iYWwgUmFwaGFlbCwgJCAqL1xuXG4oZnVuY3Rpb24oKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXG5cdHZhciBTdmdDYW52YXMgPSByZXF1aXJlKFwiLi9zdmdfY2FudmFzLmpzXCIpO1xuXHR2YXIgSHRtbEVsZW1lbnQgPSByZXF1aXJlKFwiLi9odG1sX2VsZW1lbnQuanNcIik7XG5cdHZhciBicm93c2VyID0gcmVxdWlyZShcIi4vYnJvd3Nlci5qc1wiKTtcblx0dmFyIGZhaWxGYXN0ID0gcmVxdWlyZShcIi4vZmFpbF9mYXN0LmpzXCIpO1xuXG5cdHZhciBzdmdDYW52YXMgPSBudWxsO1xuXHR2YXIgc3RhcnQgPSBudWxsO1xuXHR2YXIgbGluZURyYXduID0gZmFsc2U7XG5cdHZhciBkcmF3aW5nQXJlYTtcblx0dmFyIGNsZWFyU2NyZWVuQnV0dG9uO1xuXHR2YXIgZG9jdW1lbnRCb2R5O1xuXHR2YXIgd2luZG93RWxlbWVudDtcblx0dmFyIHVzZVNldENhcHR1cmVBcGkgPSBmYWxzZTtcblxuXHRleHBvcnRzLmluaXRpYWxpemVEcmF3aW5nQXJlYSA9IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG5cdFx0aWYgKHN2Z0NhbnZhcyAhPT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKFwiQ2xpZW50LmpzIGlzIG5vdCByZS1lbnRyYW50XCIpO1xuXG5cdFx0ZHJhd2luZ0FyZWEgPSBlbGVtZW50cy5kcmF3aW5nQXJlYURpdjtcblx0XHRjbGVhclNjcmVlbkJ1dHRvbiA9IGVsZW1lbnRzLmNsZWFyU2NyZWVuQnV0dG9uO1xuXG5cdFx0ZmFpbEZhc3QudW5sZXNzRGVmaW5lZChkcmF3aW5nQXJlYSwgXCJlbGVtZW50cy5kcmF3aW5nQXJlYVwiKTtcblx0XHRmYWlsRmFzdC51bmxlc3NEZWZpbmVkKGNsZWFyU2NyZWVuQnV0dG9uLCBcImVsZW1lbnRzLmNsZWFyU2NyZWVuQnV0dG9uXCIpO1xuXG5cdFx0ZG9jdW1lbnRCb2R5ID0gbmV3IEh0bWxFbGVtZW50KGRvY3VtZW50LmJvZHkpO1xuXHRcdHdpbmRvd0VsZW1lbnQgPSBuZXcgSHRtbEVsZW1lbnQod2luZG93KTtcblxuXHRcdHN2Z0NhbnZhcyA9IG5ldyBTdmdDYW52YXMoZHJhd2luZ0FyZWEpO1xuXG5cdFx0ZHJhd2luZ0FyZWEucHJldmVudEJyb3dzZXJEcmFnRGVmYXVsdHMoKTtcblx0XHRoYW5kbGVDbGVhclNjcmVlbkNsaWNrKCk7XG5cdFx0aGFuZGxlTW91c2VEcmFnRXZlbnRzKCk7XG5cdFx0aGFuZGxlVG91Y2hEcmFnRXZlbnRzKCk7XG5cblx0XHRyZXR1cm4gc3ZnQ2FudmFzO1xuXHR9O1xuXG5cdGV4cG9ydHMuZHJhd2luZ0FyZWFIYXNCZWVuUmVtb3ZlZEZyb21Eb20gPSBmdW5jdGlvbigpIHtcblx0XHRzdmdDYW52YXMgPSBudWxsO1xuXHR9O1xuXG5cdGZ1bmN0aW9uIGhhbmRsZUNsZWFyU2NyZWVuQ2xpY2soKSB7XG5cdFx0Y2xlYXJTY3JlZW5CdXR0b24ub25Nb3VzZUNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcdFx0c3ZnQ2FudmFzLmNsZWFyKCk7XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBoYW5kbGVNb3VzZURyYWdFdmVudHMoKSB7XG5cdFx0ZHJhd2luZ0FyZWEub25Nb3VzZURvd24oc3RhcnREcmFnKTtcblx0XHRkb2N1bWVudEJvZHkub25Nb3VzZU1vdmUoY29udGludWVEcmFnKTtcblx0XHR3aW5kb3dFbGVtZW50Lm9uTW91c2VVcChlbmREcmFnKTtcblxuXHRcdGlmIChicm93c2VyLmRvZXNOb3RIYW5kbGVzVXNlckV2ZW50c09uV2luZG93KCkpIHtcblx0XHRcdGRyYXdpbmdBcmVhLm9uTW91c2VVcChlbmREcmFnKTtcblx0XHRcdHVzZVNldENhcHR1cmVBcGkgPSB0cnVlO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGhhbmRsZVRvdWNoRHJhZ0V2ZW50cygpIHtcblx0XHRkcmF3aW5nQXJlYS5vblNpbmdsZVRvdWNoU3RhcnQoc3RhcnREcmFnKTtcblx0XHRkcmF3aW5nQXJlYS5vblNpbmdsZVRvdWNoTW92ZShjb250aW51ZURyYWcpO1xuXHRcdGRyYXdpbmdBcmVhLm9uVG91Y2hFbmQoZW5kRHJhZyk7XG5cdFx0ZHJhd2luZ0FyZWEub25Ub3VjaENhbmNlbChlbmREcmFnKTtcblxuXHRcdGRyYXdpbmdBcmVhLm9uTXVsdGlUb3VjaFN0YXJ0KGVuZERyYWcpO1xuXHR9XG5cblx0ZnVuY3Rpb24gc3RhcnREcmFnKHBhZ2VPZmZzZXQpIHtcblx0XHRzdGFydCA9IGRyYXdpbmdBcmVhLnJlbGF0aXZlT2Zmc2V0KHBhZ2VPZmZzZXQpO1xuICAgIGlmICh1c2VTZXRDYXB0dXJlQXBpKSBkcmF3aW5nQXJlYS5zZXRDYXB0dXJlKCk7XG5cdH1cblxuXHRmdW5jdGlvbiBjb250aW51ZURyYWcocGFnZU9mZnNldCkge1xuXHRcdGlmICghaXNDdXJyZW50bHlEcmF3aW5nKCkpIHJldHVybjtcblxuXHRcdHZhciBlbmQgPSBkcmF3aW5nQXJlYS5yZWxhdGl2ZU9mZnNldChwYWdlT2Zmc2V0KTtcblx0XHRpZiAoc3RhcnQueCAhPT0gZW5kLnggfHwgc3RhcnQueSAhPT0gZW5kLnkpIHtcblx0XHRcdHN2Z0NhbnZhcy5kcmF3TGluZShzdGFydC54LCBzdGFydC55LCBlbmQueCwgZW5kLnkpO1xuXHRcdFx0c3RhcnQgPSBlbmQ7XG5cdFx0XHRsaW5lRHJhd24gPSB0cnVlO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGVuZERyYWcoKSB7XG5cdFx0aWYgKCFpc0N1cnJlbnRseURyYXdpbmcoKSkgcmV0dXJuO1xuXG5cdFx0aWYgKCFsaW5lRHJhd24pIHN2Z0NhbnZhcy5kcmF3RG90KHN0YXJ0LngsIHN0YXJ0LnkpO1xuXG5cdFx0aWYgKHVzZVNldENhcHR1cmVBcGkpIGRyYXdpbmdBcmVhLnJlbGVhc2VDYXB0dXJlKCk7XG5cdFx0c3RhcnQgPSBudWxsO1xuXHRcdGxpbmVEcmF3biA9IGZhbHNlO1xuXHR9XG5cblx0ZnVuY3Rpb24gaXNDdXJyZW50bHlEcmF3aW5nKCkge1xuXHRcdHJldHVybiBzdGFydCAhPT0gbnVsbDtcblx0fVxuXG59KCkpOyIsIi8vIENvcHlyaWdodCAoYykgMjAxMyBUaXRhbml1bSBJLlQuIExMQy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gU2VlIExJQ0VOU0UuVFhUIGZvciBkZXRhaWxzLlxuKGZ1bmN0aW9uKCkge1xuXHRcInVzZSBzdHJpY3RcIjtcblxuXHRleHBvcnRzLnVubGVzc0RlZmluZWQgPSBmdW5jdGlvbih2YXJpYWJsZSwgdmFyaWFibGVOYW1lKSB7XG5cdFx0dmFyaWFibGVOYW1lID0gdmFyaWFibGVOYW1lID8gXCIgW1wiICsgdmFyaWFibGVOYW1lICsgXCJdIFwiIDogXCIgXCI7XG5cdFx0aWYgKHZhcmlhYmxlID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBGYWlsRmFzdEV4Y2VwdGlvbihleHBvcnRzLnVubGVzc0RlZmluZWQsIFwiUmVxdWlyZWQgdmFyaWFibGVcIiArIHZhcmlhYmxlTmFtZSArIFwid2FzIG5vdCBkZWZpbmVkXCIpO1xuXHR9O1xuXG5cdGV4cG9ydHMudW5sZXNzVHJ1ZSA9IGZ1bmN0aW9uKHZhcmlhYmxlLCBtZXNzYWdlKSB7XG5cdFx0aWYgKG1lc3NhZ2UgPT09IHVuZGVmaW5lZCkgbWVzc2FnZSA9IFwiRXhwZWN0ZWQgY29uZGl0aW9uIHRvIGJlIHRydWVcIjtcblxuXHRcdGlmICh2YXJpYWJsZSA9PT0gZmFsc2UpIHRocm93IG5ldyBGYWlsRmFzdEV4Y2VwdGlvbihleHBvcnRzLnVubGVzc1RydWUsIG1lc3NhZ2UpO1xuXHRcdGlmICh2YXJpYWJsZSAhPT0gdHJ1ZSkgdGhyb3cgbmV3IEZhaWxGYXN0RXhjZXB0aW9uKGV4cG9ydHMudW5sZXNzVHJ1ZSwgXCJFeHBlY3RlZCBjb25kaXRpb24gdG8gYmUgdHJ1ZSBvciBmYWxzZVwiKTtcblx0fTtcblxuXHRleHBvcnRzLnVucmVhY2hhYmxlID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHRcdGlmICghbWVzc2FnZSkgbWVzc2FnZSA9IFwiVW5yZWFjaGFibGUgY29kZSBleGVjdXRlZFwiO1xuXG5cdFx0dGhyb3cgbmV3IEZhaWxGYXN0RXhjZXB0aW9uKGV4cG9ydHMudW5yZWFjaGFibGUsIG1lc3NhZ2UpO1xuXHR9O1xuXG5cdHZhciBGYWlsRmFzdEV4Y2VwdGlvbiA9IGV4cG9ydHMuRmFpbEZhc3RFeGNlcHRpb24gPSBmdW5jdGlvbihmblRvUmVtb3ZlRnJvbVN0YWNrVHJhY2UsIG1lc3NhZ2UpIHtcblx0XHRpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIGZuVG9SZW1vdmVGcm9tU3RhY2tUcmFjZSk7ICAgIC8vIG9ubHkgd29ya3Mgb24gQ2hyb21lL1Y4XG5cdFx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcblx0fTtcblx0RmFpbEZhc3RFeGNlcHRpb24ucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cdEZhaWxGYXN0RXhjZXB0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEZhaWxGYXN0RXhjZXB0aW9uO1xuXHRGYWlsRmFzdEV4Y2VwdGlvbi5wcm90b3R5cGUubmFtZSA9IFwiRmFpbEZhc3RFeGNlcHRpb25cIjtcblxufSgpKTsiLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTMgVGl0YW5pdW0gSS5ULiBMTEMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIFNlZSBMSUNFTlNFLnR4dCBmb3IgZGV0YWlscy5cbi8qZ2xvYmFsICQsIGpRdWVyeSwgVG91Y2hMaXN0LCBUb3VjaCAqL1xuXG4oZnVuY3Rpb24oKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXG5cdHZhciBicm93c2VyID0gcmVxdWlyZShcIi4vYnJvd3Nlci5qc1wiKTtcblx0dmFyIGZhaWxGYXN0ID0gcmVxdWlyZShcIi4vZmFpbF9mYXN0LmpzXCIpO1xuXG5cdHZhciBjYXB0dXJlZEVsZW1lbnQgPSBudWxsO1xuXG5cblx0LyogQ29uc3RydWN0b3JzICovXG5cblx0dmFyIEh0bWxFbGVtZW50ID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkb21FbGVtZW50KSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0c2VsZi5fZG9tRWxlbWVudCA9IGRvbUVsZW1lbnQ7XG5cdFx0c2VsZi5fZWxlbWVudCA9ICQoZG9tRWxlbWVudCk7XG5cdFx0c2VsZi5fZHJhZ0RlZmF1bHRzUHJldmVudGVkID0gZmFsc2U7XG5cdH07XG5cblx0SHRtbEVsZW1lbnQuZnJvbUh0bWwgPSBmdW5jdGlvbihodG1sKSB7XG5cdFx0cmV0dXJuIG5ldyBIdG1sRWxlbWVudCgkKGh0bWwpWzBdKTtcblx0fTtcblxuXHRIdG1sRWxlbWVudC5mcm9tSWQgPSBmdW5jdGlvbihpZCkge1xuXHRcdHZhciBkb21FbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuXHRcdGZhaWxGYXN0LnVubGVzc1RydWUoZG9tRWxlbWVudCAhPT0gbnVsbCwgXCJjb3VsZCBub3QgZmluZCBlbGVtZW50IHdpdGggaWQgJ1wiICsgaWQgKyBcIidcIik7XG5cdFx0cmV0dXJuIG5ldyBIdG1sRWxlbWVudChkb21FbGVtZW50KTtcblx0fTtcblxuXHQvKiBDYXB0dXJlIEFQSSAqL1xuXG5cdEh0bWxFbGVtZW50LnByb3RvdHlwZS5zZXRDYXB0dXJlID0gZnVuY3Rpb24oKSB7XG5cdFx0Y2FwdHVyZWRFbGVtZW50ID0gdGhpcztcblx0XHR0aGlzLl9kb21FbGVtZW50LnNldENhcHR1cmUoKTtcblx0fTtcblxuXHRIdG1sRWxlbWVudC5wcm90b3R5cGUucmVsZWFzZUNhcHR1cmUgPSBmdW5jdGlvbigpIHtcblx0XHRjYXB0dXJlZEVsZW1lbnQgPSBudWxsO1xuXHRcdHRoaXMuX2RvbUVsZW1lbnQucmVsZWFzZUNhcHR1cmUoKTtcblx0fTtcblxuXG5cdC8qIEdlbmVyYWwgZXZlbnQgaGFuZGxpbmcgKi9cblxuXHRIdG1sRWxlbWVudC5wcm90b3R5cGUucmVtb3ZlQWxsRXZlbnRIYW5kbGVycyA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX2VsZW1lbnQub2ZmKCk7XG5cdH07XG5cblx0SHRtbEVsZW1lbnQucHJvdG90eXBlLnByZXZlbnRCcm93c2VyRHJhZ0RlZmF1bHRzID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fZWxlbWVudC5vbihcInNlbGVjdHN0YXJ0XCIsIHByZXZlbnREZWZhdWx0cyk7XG5cdFx0dGhpcy5fZWxlbWVudC5vbihcIm1vdXNlZG93blwiLCBwcmV2ZW50RGVmYXVsdHMpO1xuXHRcdHRoaXMuX2VsZW1lbnQub24oXCJ0b3VjaHN0YXJ0XCIsIHByZXZlbnREZWZhdWx0cyk7XG5cblx0XHR0aGlzLl9kcmFnRGVmYXVsdHNQcmV2ZW50ZWQgPSB0cnVlO1xuXG5cdFx0ZnVuY3Rpb24gcHJldmVudERlZmF1bHRzKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblx0fTtcblxuXHRIdG1sRWxlbWVudC5wcm90b3R5cGUuaXNCcm93c2VyRHJhZ0RlZmF1bHRzUHJldmVudGVkID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2RyYWdEZWZhdWx0c1ByZXZlbnRlZDtcblx0fTtcblxuXHQvKiBNb3VzZSBldmVudHMgKi9cblx0SHRtbEVsZW1lbnQucHJvdG90eXBlLnRyaWdnZXJNb3VzZUNsaWNrID0gdHJpZ2dlck1vdXNlRXZlbnRGbihcImNsaWNrXCIpO1xuXHRIdG1sRWxlbWVudC5wcm90b3R5cGUudHJpZ2dlck1vdXNlRG93biA9IHRyaWdnZXJNb3VzZUV2ZW50Rm4oXCJtb3VzZWRvd25cIik7XG5cdEh0bWxFbGVtZW50LnByb3RvdHlwZS50cmlnZ2VyTW91c2VNb3ZlID0gdHJpZ2dlck1vdXNlRXZlbnRGbihcIm1vdXNlbW92ZVwiKTtcblx0SHRtbEVsZW1lbnQucHJvdG90eXBlLnRyaWdnZXJNb3VzZUxlYXZlID0gdHJpZ2dlck1vdXNlRXZlbnRGbihcIm1vdXNlbGVhdmVcIik7XG5cdEh0bWxFbGVtZW50LnByb3RvdHlwZS50cmlnZ2VyTW91c2VVcCA9IHRyaWdnZXJNb3VzZUV2ZW50Rm4oXCJtb3VzZXVwXCIpO1xuXG5cdEh0bWxFbGVtZW50LnByb3RvdHlwZS5vbk1vdXNlQ2xpY2sgPSBvbk1vdXNlRXZlbnRGbihcImNsaWNrXCIpO1xuXHRIdG1sRWxlbWVudC5wcm90b3R5cGUub25Nb3VzZURvd24gPSBvbk1vdXNlRXZlbnRGbihcIm1vdXNlZG93blwiKTtcblx0SHRtbEVsZW1lbnQucHJvdG90eXBlLm9uTW91c2VNb3ZlID0gb25Nb3VzZUV2ZW50Rm4oXCJtb3VzZW1vdmVcIik7XG5cdEh0bWxFbGVtZW50LnByb3RvdHlwZS5vbk1vdXNlTGVhdmUgPSBvbk1vdXNlRXZlbnRGbihcIm1vdXNlbGVhdmVcIik7XG5cdEh0bWxFbGVtZW50LnByb3RvdHlwZS5vbk1vdXNlVXAgPSBvbk1vdXNlRXZlbnRGbihcIm1vdXNldXBcIik7XG5cblx0ZnVuY3Rpb24gdHJpZ2dlck1vdXNlRXZlbnRGbihldmVudCkge1xuXHRcdHJldHVybiBmdW5jdGlvbihyZWxhdGl2ZVgsIHJlbGF0aXZlWSkge1xuXHRcdFx0dmFyIHRhcmdldEVsZW1lbnQgPSBjYXB0dXJlZEVsZW1lbnQgfHwgdGhpcztcblxuXHRcdFx0dmFyIHBhZ2VDb29yZHM7XG5cdFx0XHRpZiAocmVsYXRpdmVYID09PSB1bmRlZmluZWQgfHwgcmVsYXRpdmVZID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0cGFnZUNvb3JkcyA9IHsgeDogMCwgeTogMCB9O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHBhZ2VDb29yZHMgPSBwYWdlT2Zmc2V0KHRoaXMsIHJlbGF0aXZlWCwgcmVsYXRpdmVZKTtcblx0XHRcdH1cblxuXHRcdFx0c2VuZE1vdXNlRXZlbnQodGFyZ2V0RWxlbWVudCwgZXZlbnQsIHBhZ2VDb29yZHMpO1xuXHRcdH07XG5cdH1cblxuXHRmdW5jdGlvbiBvbk1vdXNlRXZlbnRGbihldmVudCkge1xuXHRcdHJldHVybiBmdW5jdGlvbihjYWxsYmFjaykge1xuXHRcdFx0aWYgKGJyb3dzZXIuZG9lc05vdEhhbmRsZXNVc2VyRXZlbnRzT25XaW5kb3coKSAmJiB0aGlzLl9kb21FbGVtZW50ID09PSB3aW5kb3cpIHJldHVybjtcblxuXHRcdFx0dGhpcy5fZWxlbWVudC5vbihldmVudCwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0dmFyIHBhZ2VPZmZzZXQgPSB7IHg6IGV2ZW50LnBhZ2VYLCB5OiBldmVudC5wYWdlWSB9O1xuXHRcdFx0XHRjYWxsYmFjayhwYWdlT2Zmc2V0KTtcblx0XHRcdH0pO1xuXHRcdH07XG5cdH1cblxuXHRmdW5jdGlvbiBzZW5kTW91c2VFdmVudChzZWxmLCBldmVudCwgcGFnZUNvb3Jkcykge1xuXHRcdHZhciBqcUVsZW1lbnQgPSBzZWxmLl9lbGVtZW50O1xuXG5cdFx0dmFyIGV2ZW50RGF0YSA9IG5ldyBqUXVlcnkuRXZlbnQoKTtcblx0XHRldmVudERhdGEucGFnZVggPSBwYWdlQ29vcmRzLng7XG5cdFx0ZXZlbnREYXRhLnBhZ2VZID0gcGFnZUNvb3Jkcy55O1xuXHRcdGV2ZW50RGF0YS50eXBlID0gZXZlbnQ7XG5cdFx0anFFbGVtZW50LnRyaWdnZXIoZXZlbnREYXRhKTtcblx0fVxuXG5cblx0LyogVG91Y2ggZXZlbnRzICovXG5cblx0SHRtbEVsZW1lbnQucHJvdG90eXBlLnRyaWdnZXJUb3VjaEVuZCA9IHRyaWdnZXJaZXJvVG91Y2hFdmVudEZuKFwidG91Y2hlbmRcIik7XG5cdEh0bWxFbGVtZW50LnByb3RvdHlwZS50cmlnZ2VyVG91Y2hDYW5jZWwgPSB0cmlnZ2VyWmVyb1RvdWNoRXZlbnRGbihcInRvdWNoY2FuY2VsXCIpO1xuXHRIdG1sRWxlbWVudC5wcm90b3R5cGUudHJpZ2dlclNpbmdsZVRvdWNoU3RhcnQgPSB0cmlnZ2VyU2luZ2xlVG91Y2hFdmVudEZuKFwidG91Y2hzdGFydFwiKTtcblx0SHRtbEVsZW1lbnQucHJvdG90eXBlLnRyaWdnZXJTaW5nbGVUb3VjaE1vdmUgPSB0cmlnZ2VyU2luZ2xlVG91Y2hFdmVudEZuKFwidG91Y2htb3ZlXCIpO1xuXHRIdG1sRWxlbWVudC5wcm90b3R5cGUudHJpZ2dlck11bHRpVG91Y2hTdGFydCA9IHRyaWdnZXJNdWx0aVRvdWNoRXZlbnRGbihcInRvdWNoc3RhcnRcIik7XG5cblx0SHRtbEVsZW1lbnQucHJvdG90eXBlLm9uVG91Y2hFbmQgPSBvblplcm9Ub3VjaEV2ZW50Rm4oXCJ0b3VjaGVuZFwiKTtcblx0SHRtbEVsZW1lbnQucHJvdG90eXBlLm9uVG91Y2hDYW5jZWwgPSBvblplcm9Ub3VjaEV2ZW50Rm4oXCJ0b3VjaGNhbmNlbFwiKTtcblx0SHRtbEVsZW1lbnQucHJvdG90eXBlLm9uU2luZ2xlVG91Y2hTdGFydCA9IG9uU2luZ2xlVG91Y2hFdmVudEZuKFwidG91Y2hzdGFydFwiKTtcblx0SHRtbEVsZW1lbnQucHJvdG90eXBlLm9uU2luZ2xlVG91Y2hNb3ZlID0gb25TaW5nbGVUb3VjaEV2ZW50Rm4oXCJ0b3VjaG1vdmVcIik7XG5cdEh0bWxFbGVtZW50LnByb3RvdHlwZS5vbk11bHRpVG91Y2hTdGFydCA9IG9uTXVsdGlUb3VjaEV2ZW50Rm4oXCJ0b3VjaHN0YXJ0XCIpO1xuXG5cdGZ1bmN0aW9uIHRyaWdnZXJaZXJvVG91Y2hFdmVudEZuKGV2ZW50KSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0c2VuZFRvdWNoRXZlbnQodGhpcywgZXZlbnQsIG5ldyBUb3VjaExpc3QoKSk7XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIHRyaWdnZXJTaW5nbGVUb3VjaEV2ZW50Rm4oZXZlbnQpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24ocmVsYXRpdmVYLCByZWxhdGl2ZVkpIHtcblx0XHRcdHZhciB0b3VjaCA9IGNyZWF0ZVRvdWNoKHRoaXMsIHJlbGF0aXZlWCwgcmVsYXRpdmVZKTtcblx0XHRcdHNlbmRUb3VjaEV2ZW50KHRoaXMsIGV2ZW50LCBuZXcgVG91Y2hMaXN0KHRvdWNoKSk7XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIHRyaWdnZXJNdWx0aVRvdWNoRXZlbnRGbihldmVudCkge1xuXHRcdHJldHVybiBmdW5jdGlvbihyZWxhdGl2ZTFYLCByZWxhdGl2ZTFZLCByZWxhdGl2ZTJYLCByZWxhdGl2ZTJZKSB7XG5cdFx0XHR2YXIgdG91Y2gxID0gY3JlYXRlVG91Y2godGhpcywgcmVsYXRpdmUxWCwgcmVsYXRpdmUxWSk7XG5cdFx0XHR2YXIgdG91Y2gyID0gY3JlYXRlVG91Y2godGhpcywgcmVsYXRpdmUyWCwgcmVsYXRpdmUyWSk7XG5cdFx0XHRzZW5kVG91Y2hFdmVudCh0aGlzLCBldmVudCwgbmV3IFRvdWNoTGlzdCh0b3VjaDEsIHRvdWNoMikpO1xuXHRcdH07XG5cdH1cblxuXG5cdGZ1bmN0aW9uIG9uWmVyb1RvdWNoRXZlbnRGbihldmVudCkge1xuXHRcdHJldHVybiBmdW5jdGlvbihjYWxsYmFjaykge1xuXHRcdFx0dGhpcy5fZWxlbWVudC5vbihldmVudCwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHR9KTtcblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gb25TaW5nbGVUb3VjaEV2ZW50Rm4oZXZlbnROYW1lKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0XHR0aGlzLl9lbGVtZW50Lm9uKGV2ZW50TmFtZSwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0dmFyIG9yaWdpbmFsRXZlbnQgPSBldmVudC5vcmlnaW5hbEV2ZW50O1xuXHRcdFx0XHRpZiAob3JpZ2luYWxFdmVudC50b3VjaGVzLmxlbmd0aCAhPT0gMSkgcmV0dXJuO1xuXG5cdFx0XHRcdHZhciBwYWdlWCA9IG9yaWdpbmFsRXZlbnQudG91Y2hlc1swXS5wYWdlWDtcblx0XHRcdFx0dmFyIHBhZ2VZID0gb3JpZ2luYWxFdmVudC50b3VjaGVzWzBdLnBhZ2VZO1xuXHRcdFx0XHR2YXIgb2Zmc2V0ID0geyB4OiBwYWdlWCwgeTogcGFnZVkgfTtcblxuXHRcdFx0XHRjYWxsYmFjayhvZmZzZXQpO1xuXHRcdFx0fSk7XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIG9uTXVsdGlUb3VjaEV2ZW50Rm4oZXZlbnQpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdHRoaXMuX2VsZW1lbnQub24oZXZlbnQsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdHZhciBvcmlnaW5hbEV2ZW50ID0gZXZlbnQub3JpZ2luYWxFdmVudDtcblx0XHRcdFx0aWYgKG9yaWdpbmFsRXZlbnQudG91Y2hlcy5sZW5ndGggIT09IDEpIGNhbGxiYWNrKCk7XG5cdFx0XHR9KTtcblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gc2VuZFRvdWNoRXZlbnQoc2VsZiwgZXZlbnQsIHRvdWNoTGlzdCkge1xuXHRcdHZhciB0b3VjaEV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJUb3VjaEV2ZW50XCIpO1xuXHRcdHRvdWNoRXZlbnQuaW5pdFRvdWNoRXZlbnQoXG5cdFx0XHRldmVudCwgLy8gZXZlbnQgdHlwZVxuXHRcdFx0dHJ1ZSwgLy8gY2FuQnViYmxlXG5cdFx0XHR0cnVlLCAvLyBjYW5jZWxhYmxlXG5cdFx0XHR3aW5kb3csIC8vIERPTSB3aW5kb3dcblx0XHRcdG51bGwsIC8vIGRldGFpbCAobm90IHN1cmUgd2hhdCB0aGlzIGlzKVxuXHRcdFx0MCwgMCwgLy8gc2NyZWVuWC9ZXG5cdFx0XHQwLCAwLCAvLyBjbGllbnRYL1lcblx0XHRcdGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCAvLyBtZXRhIGtleXMgKHNoaWZ0IGV0Yy4pXG5cdFx0XHR0b3VjaExpc3QsIHRvdWNoTGlzdCwgdG91Y2hMaXN0XG5cdFx0KTtcblxuXHRcdHZhciBldmVudERhdGEgPSBuZXcgalF1ZXJ5LkV2ZW50KFwiZXZlbnRcIik7XG5cdFx0ZXZlbnREYXRhLnR5cGUgPSBldmVudDtcblx0XHRldmVudERhdGEub3JpZ2luYWxFdmVudCA9IHRvdWNoRXZlbnQ7XG5cdFx0c2VsZi5fZWxlbWVudC50cmlnZ2VyKGV2ZW50RGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBjcmVhdGVUb3VjaChzZWxmLCByZWxhdGl2ZVgsIHJlbGF0aXZlWSkge1xuXHRcdHZhciBvZmZzZXQgPSBwYWdlT2Zmc2V0KHNlbGYsIHJlbGF0aXZlWCwgcmVsYXRpdmVZKTtcblxuXHRcdHZhciB0YXJnZXQgPSBzZWxmLl9lbGVtZW50WzBdO1xuXHRcdHZhciBpZGVudGlmaWVyID0gMDtcblx0XHR2YXIgcGFnZVggPSBvZmZzZXQueDtcblx0XHR2YXIgcGFnZVkgPSBvZmZzZXQueTtcblx0XHR2YXIgc2NyZWVuWCA9IDA7XG5cdFx0dmFyIHNjcmVlblkgPSAwO1xuXG5cdFx0cmV0dXJuIG5ldyBUb3VjaCh1bmRlZmluZWQsIHRhcmdldCwgaWRlbnRpZmllciwgcGFnZVgsIHBhZ2VZLCBzY3JlZW5YLCBzY3JlZW5ZKTtcblx0fVxuXG5cblx0LyogRGltZW5zaW9ucywgb2Zmc2V0cywgYW5kIHBvc2l0aW9uaW5nICovXG5cblx0SHRtbEVsZW1lbnQucHJvdG90eXBlLmdldERpbWVuc2lvbnMgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0d2lkdGg6IHRoaXMuX2VsZW1lbnQud2lkdGgoKSxcblx0XHRcdGhlaWdodDogdGhpcy5fZWxlbWVudC5oZWlnaHQoKVxuXHRcdH07XG5cdH07XG5cblx0SHRtbEVsZW1lbnQucHJvdG90eXBlLnJlbGF0aXZlT2Zmc2V0ID0gZnVuY3Rpb24ocGFnZU9mZnNldCkge1xuXHRcdHJldHVybiByZWxhdGl2ZU9mZnNldCh0aGlzLCBwYWdlT2Zmc2V0LngsIHBhZ2VPZmZzZXQueSk7XG5cdH07XG5cblx0SHRtbEVsZW1lbnQucHJvdG90eXBlLnBhZ2VPZmZzZXQgPSBmdW5jdGlvbihyZWxhdGl2ZU9mZnNldCkge1xuXHRcdHJldHVybiBwYWdlT2Zmc2V0KHRoaXMsIHJlbGF0aXZlT2Zmc2V0LngsIHJlbGF0aXZlT2Zmc2V0LnkpO1xuXHR9O1xuXG5cdGZ1bmN0aW9uIHJlbGF0aXZlT2Zmc2V0KHNlbGYsIHBhZ2VYLCBwYWdlWSkge1xuXHRcdGZhaWxGYXN0SWZTdHlsaW5nUHJlc2VudChzZWxmKTtcblxuXHRcdHZhciBwYWdlT2Zmc2V0ID0gc2VsZi5fZWxlbWVudC5vZmZzZXQoKTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0eDogcGFnZVggLSBwYWdlT2Zmc2V0LmxlZnQsXG5cdFx0XHR5OiBwYWdlWSAtIHBhZ2VPZmZzZXQudG9wXG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIHBhZ2VPZmZzZXQoc2VsZiwgcmVsYXRpdmVYLCByZWxhdGl2ZVkpIHtcblx0XHRmYWlsRmFzdElmU3R5bGluZ1ByZXNlbnQoc2VsZik7XG5cblx0XHR2YXIgdG9wTGVmdE9mRHJhd2luZ0FyZWEgPSBzZWxmLl9lbGVtZW50Lm9mZnNldCgpO1xuXHRcdHJldHVybiB7XG5cdFx0XHR4OiByZWxhdGl2ZVggKyB0b3BMZWZ0T2ZEcmF3aW5nQXJlYS5sZWZ0LFxuXHRcdFx0eTogcmVsYXRpdmVZICsgdG9wTGVmdE9mRHJhd2luZ0FyZWEudG9wXG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIGZhaWxGYXN0SWZTdHlsaW5nUHJlc2VudChzZWxmKSB7XG5cdFx0ZmFpbEZhc3RJZlBhZGRpbmdQcmVzZW50KFwidG9wXCIpO1xuXHRcdGZhaWxGYXN0SWZQYWRkaW5nUHJlc2VudChcImxlZnRcIik7XG5cdFx0ZmFpbEZhc3RJZkJvcmRlclByZXNlbnQoXCJ0b3BcIik7XG5cdFx0ZmFpbEZhc3RJZkJvcmRlclByZXNlbnQoXCJsZWZ0XCIpO1xuXG5cdFx0ZnVuY3Rpb24gZmFpbEZhc3RJZlBhZGRpbmdQcmVzZW50KHNpZGUpIHtcblx0XHRcdHZhciBjc3MgPSBzZWxmLl9lbGVtZW50LmNzcyhcInBhZGRpbmctXCIgKyBzaWRlKTtcblx0XHRcdGlmIChjc3MgIT09IFwiMHB4XCIpIHRocm93IG5ldyBFcnJvcihcIkRvIG5vdCBhcHBseSBwYWRkaW5nIHRvIGVsZW1lbnRzIHVzZWQgd2l0aCByZWxhdGl2ZU9mZnNldCgpXCIpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGZhaWxGYXN0SWZCb3JkZXJQcmVzZW50KHNpZGUpIHtcblx0XHRcdHZhciB0ZXh0ID0gc2VsZi5fZWxlbWVudC5jc3MoXCJib3JkZXItXCIgKyBzaWRlICsgXCItd2lkdGhcIik7XG5cdFx0XHRpZiAoYnJvd3Nlci5kb2VzTm90Q29tcHV0ZVN0eWxlcygpKSB7XG5cdFx0XHRcdGlmIChzZWxmLl9lbGVtZW50LmNzcyhcImJvcmRlci1cIiArIHNpZGUgKyBcIi1zdHlsZVwiKSA9PT0gXCJub25lXCIpIHRleHQgPSBcIjBweFwiO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGV4dCAhPT0gXCIwcHhcIikgdGhyb3cgbmV3IEVycm9yKFwiRG8gbm90IGFwcGx5IGJvcmRlciB0byBlbGVtZW50cyB1c2VkIHdpdGggcmVsYXRpdmVPZmZzZXQoKVwiKTtcblx0XHR9XG5cdH1cblxuXHQvKiBET00gTWFuaXB1bGF0aW9uICovXG5cblx0SHRtbEVsZW1lbnQucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uKGVsZW1lbnRUb0FwcGVuZCkge1xuXHRcdHRoaXMuX2VsZW1lbnQuYXBwZW5kKGVsZW1lbnRUb0FwcGVuZC5fZWxlbWVudCk7XG5cdH07XG5cblx0SHRtbEVsZW1lbnQucHJvdG90eXBlLmFwcGVuZFNlbGZUb0JvZHkgPSBmdW5jdGlvbigpIHtcblx0XHQkKGRvY3VtZW50LmJvZHkpLmFwcGVuZCh0aGlzLl9lbGVtZW50KTtcblx0fTtcblxuXHRIdG1sRWxlbWVudC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fZWxlbWVudC5yZW1vdmUoKTtcblx0fTtcblxuXHRIdG1sRWxlbWVudC5wcm90b3R5cGUudG9Eb21FbGVtZW50ID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2VsZW1lbnRbMF07XG5cdH07XG5cbn0oKSk7IiwiLy8gQ29weXJpZ2h0IChjKSAyMDEzIFRpdGFuaXVtIEkuVC4gTExDLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBTZWUgTElDRU5TRS5UWFQgZm9yIGRldGFpbHMuXG4vKmdsb2JhbCBSYXBoYWVsICovXG5cbihmdW5jdGlvbigpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cblx0dmFyIFN2Z0NhbnZhcyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaHRtbEVsZW1lbnQpIHtcblx0XHR2YXIgZGltZW5zaW9ucyA9IGh0bWxFbGVtZW50LmdldERpbWVuc2lvbnMoKTtcblx0XHR0aGlzLl9wYXBlciA9IG5ldyBSYXBoYWVsKGh0bWxFbGVtZW50LnRvRG9tRWxlbWVudCgpLCBkaW1lbnNpb25zLndpZHRoLCBkaW1lbnNpb25zLmhlaWdodCk7XG5cdH07XG5cblx0U3ZnQ2FudmFzLkxJTkVfQ09MT1IgPSBcImJsYWNrXCI7XG5cdFN2Z0NhbnZhcy5TVFJPS0VfV0lEVEggPSAyO1xuXHRTdmdDYW52YXMuTElORV9DQVAgPSBcInJvdW5kXCI7XG5cblx0U3ZnQ2FudmFzLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX3BhcGVyLmNsZWFyKCk7XG5cdH07XG5cblx0U3ZnQ2FudmFzLnByb3RvdHlwZS5kcmF3TGluZSA9IGZ1bmN0aW9uKHN0YXJ0WCwgc3RhcnRZLCBlbmRYLCBlbmRZKSB7XG5cdFx0dGhpcy5fcGFwZXIucGF0aChcIk1cIiArIHN0YXJ0WCArIFwiLFwiICsgc3RhcnRZICsgXCJMXCIgKyBlbmRYICsgXCIsXCIgKyBlbmRZKVxuXHRcdFx0LmF0dHIoe1xuXHRcdFx0XHRcInN0cm9rZVwiOiBTdmdDYW52YXMuTElORV9DT0xPUixcblx0XHRcdFx0XCJzdHJva2Utd2lkdGhcIjogU3ZnQ2FudmFzLlNUUk9LRV9XSURUSCxcblx0XHRcdFx0XCJzdHJva2UtbGluZWNhcFwiOiBTdmdDYW52YXMuTElORV9DQVBcblx0XHRcdH0pO1xuXHR9O1xuXG5cdFN2Z0NhbnZhcy5wcm90b3R5cGUuZHJhd0RvdCA9IGZ1bmN0aW9uKHgsIHkpIHtcblx0XHR0aGlzLl9wYXBlci5jaXJjbGUoeCwgeSwgU3ZnQ2FudmFzLlNUUk9LRV9XSURUSCAvIDIpXG5cdFx0XHQuYXR0cih7XG5cdFx0XHRcdFwic3Ryb2tlXCI6IFN2Z0NhbnZhcy5MSU5FX0NPTE9SLFxuXHRcdFx0XHRcImZpbGxcIjogU3ZnQ2FudmFzLkxJTkVfQ09MT1Jcblx0XHRcdH0pO1xuXHR9O1xuXG5cdFN2Z0NhbnZhcy5wcm90b3R5cGUubGluZVNlZ21lbnRzID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHJlc3VsdCA9IFtdO1xuXHRcdHRoaXMuX3BhcGVyLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuXHRcdFx0cmVzdWx0LnB1c2gobm9ybWFsaXplVG9MaW5lU2VnbWVudChlbGVtZW50KSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblxuXHRTdmdDYW52YXMucHJvdG90eXBlLmVsZW1lbnRzRm9yVGVzdGluZ09ubHkgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgcmVzdWx0ID0gW107XG5cdFx0dGhpcy5fcGFwZXIuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG5cdFx0XHRyZXN1bHQucHVzaChlbGVtZW50KTtcblx0XHR9KTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9O1xuXG5cdGZ1bmN0aW9uIG5vcm1hbGl6ZVRvTGluZVNlZ21lbnQoZWxlbWVudCkge1xuXHRcdHN3aXRjaCAoZWxlbWVudC50eXBlKSB7XG5cdFx0XHRjYXNlIFwicGF0aFwiOlxuXHRcdFx0XHRyZXR1cm4gbm9ybWFsaXplUGF0aChlbGVtZW50KTtcblx0XHRcdGNhc2UgXCJjaXJjbGVcIjpcblx0XHRcdFx0cmV0dXJuIG5vcm1hbGl6ZUNpcmNsZShlbGVtZW50KTtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gZWxlbWVudCB0eXBlOiBcIiArIGVsZW1lbnQudHlwZSk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gbm9ybWFsaXplQ2lyY2xlKGVsZW1lbnQpIHtcblx0XHRyZXR1cm4gW1xuXHRcdFx0ZWxlbWVudC5hdHRycy5jeCxcblx0XHRcdGVsZW1lbnQuYXR0cnMuY3lcblx0XHRdO1xuXHR9XG5cblx0ZnVuY3Rpb24gbm9ybWFsaXplUGF0aChlbGVtZW50KSB7XG5cdFx0aWYgKFJhcGhhZWwuc3ZnKSB7XG5cdFx0XHRyZXR1cm4gbm9ybWFsaXplU3ZnUGF0aChlbGVtZW50KTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoUmFwaGFlbC52bWwpIHtcblx0XHRcdHJldHVybiBub3JtYWxpemVWbWxQYXRoKGVsZW1lbnQpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gUmFwaGFlbCByZW5kZXJpbmcgZW5naW5lXCIpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIG5vcm1hbGl6ZVN2Z1BhdGgoZWxlbWVudCkge1xuXHRcdHZhciBwYXRoUmVnZXg7XG5cblx0XHR2YXIgcGF0aCA9IGVsZW1lbnQubm9kZS5hdHRyaWJ1dGVzLmQudmFsdWU7XG5cdFx0aWYgKHBhdGguaW5kZXhPZihcIixcIikgIT09IC0xKVxuXHRcdC8vIFdlJ3JlIGluIEZpcmVmb3gsIFNhZmFyaSwgQ2hyb21lLCB3aGljaCB1c2VzIGZvcm1hdCBcIk0yMCwzMEwzMCwzMDBcIlxuXHRcdHtcblx0XHRcdHBhdGhSZWdleCA9IC9NKFxcZCspLChcXGQrKUwoXFxkKyksKFxcZCspLztcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHQvLyBXZSdyZSBpbiBJRTksIHdoaWNoIHVzZXMgZm9ybWF0IFwiTSAyMCAzMCBMIDMwIDMwMFwiXG5cdFx0XHRwYXRoUmVnZXggPSAvTSAoXFxkKykgKFxcZCspIEwgKFxcZCspIChcXGQrKS87XG5cdFx0fVxuXHRcdHZhciBwYXRoQ29tcG9uZW50cyA9IHBhdGgubWF0Y2gocGF0aFJlZ2V4KTtcblxuXHRcdHJldHVybiBbXG5cdFx0XHRwYXRoQ29tcG9uZW50c1sxXSxcblx0XHRcdHBhdGhDb21wb25lbnRzWzJdLFxuXHRcdFx0cGF0aENvbXBvbmVudHNbM10sXG5cdFx0XHRwYXRoQ29tcG9uZW50c1s0XVxuXHRcdF07XG5cdH1cblxuXHRmdW5jdGlvbiBub3JtYWxpemVWbWxQYXRoKGVsZW1lbnQpIHtcblx0XHQvLyBXZSdyZSBpbiBJRSA4LCB3aGljaCB1c2VzIGZvcm1hdCBcIm00MzIwMDAsNjQ4MDAwIGw2NDgwMDAsNjc0NTY4MDAgZVwiXG5cdFx0dmFyIFZNTF9NQUdJQ19OVU1CRVIgPSAyMTYwMDtcblxuXHRcdHZhciBwYXRoID0gZWxlbWVudC5ub2RlLnBhdGgudmFsdWU7XG5cblx0XHR2YXIgaWU4UGF0aFJlZ2V4ID0gL20oXFxkKyksKFxcZCspIGwoXFxkKyksKFxcZCspIGUvO1xuXHRcdHZhciBpZTggPSBwYXRoLm1hdGNoKGllOFBhdGhSZWdleCk7XG5cblx0XHR2YXIgc3RhcnRYID0gaWU4WzFdIC8gVk1MX01BR0lDX05VTUJFUjtcblx0XHR2YXIgc3RhcnRZID0gaWU4WzJdIC8gVk1MX01BR0lDX05VTUJFUjtcblx0XHR2YXIgZW5kWCA9IGllOFszXSAvIFZNTF9NQUdJQ19OVU1CRVI7XG5cdFx0dmFyIGVuZFkgPSBpZThbNF0gLyBWTUxfTUFHSUNfTlVNQkVSO1xuXG5cdFx0cmV0dXJuIFtcblx0XHRcdHN0YXJ0WCxcblx0XHRcdHN0YXJ0WSxcblx0XHRcdGVuZFgsXG5cdFx0XHRlbmRZXG5cdFx0XTtcblx0fVxuXG59KCkpOyJdfQ==
