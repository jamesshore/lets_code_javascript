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