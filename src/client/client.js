// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global Raphael, $ */

(function() {
	"use strict";

	var SvgCanvas = require("./svg_canvas.js");
	var HtmlElement = require("./html_element.js");
	var browser = require("./browser.js");

	var svgCanvas = null;
	var start = null;
	var drawingArea;
	var documentBody;
	var windowElement;
	var useSetCaptureApi = false;

	exports.initializeDrawingArea = function(htmlElement) {
		if (svgCanvas !== null) throw new Error("Client.js is not re-entrant");
		drawingArea = htmlElement;
		documentBody = new HtmlElement(document.body);
		windowElement = new HtmlElement(window);

		svgCanvas = new SvgCanvas(drawingArea);

		preventDefaults();
		handleMouseDragEvents();
		handleTouchDragEvents();

		return svgCanvas;
	};

	exports.drawingAreaHasBeenRemovedFromDom = function() {
		svgCanvas = null;
	};

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
		drawingArea.onSingleTouchEnd(endDrag);
		drawingArea.onSingleTouchCancel(endDrag);

		drawingArea.onMultiTouchStart(endDrag);
	}

	function preventDefaults() {
		drawingArea.onSelectStart_ie8Only(function(relativeOffset, event) {
			// This event handler is needed so IE 8 doesn't select text when you drag outside drawing area
			event.preventDefault();
		});

		drawingArea.onMouseDown(function(relativeOffset, event) {
			event.preventDefault();
		});

		drawingArea.onSingleTouchStart(function(relativeOffset, event) {
			event.preventDefault();
		});
	}

	function startDrag(pageOffset) {
		start = drawingArea.relativeOffset(pageOffset);
    if (useSetCaptureApi) drawingArea.setCapture();
	}

	function continueDrag(pageOffset) {
		if (start === null) return;

		var end = drawingArea.relativeOffset(pageOffset);
		svgCanvas.drawLine(start.x, start.y, end.x, end.y);
		start = end;
	}

	function endDrag() {
		start = null;
		if (useSetCaptureApi) drawingArea.releaseCapture();
	}

}());