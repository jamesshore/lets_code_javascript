// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global Raphael, $ */

(function() {
	"use strict";

	var SvgCanvas = require("./svg_canvas.js");
	var HtmlElement = require("./html_element.js");

	var svgCanvas = null;
	var start = null;
	var drawingArea;
	var documentBody;
	var windowElement;

	exports.initializeDrawingArea = function(htmlElement) {
		if (svgCanvas !== null) throw new Error("Client.js is not re-entrant");
		drawingArea = htmlElement;
		documentBody = new HtmlElement($(document.body));
		windowElement = new HtmlElement($(window));

		svgCanvas = new SvgCanvas(drawingArea);
		handleDragEvents();
		return svgCanvas;
	};

	exports.drawingAreaHasBeenRemovedFromDom = function() {
		svgCanvas = null;
	};

	function handleDragEvents() {
		preventDefaults();

		drawingArea.onMouseDown(startDrag);
		documentBody.onMouseMove(continueDrag);
		windowElement.onMouseUp(endDrag);

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
	}

	function continueDrag(pageOffset) {
		if (start === null) return;

		var end = drawingArea.relativeOffset(pageOffset);
		svgCanvas.drawLine(start.x, start.y, end.x, end.y);
		start = end;
	}

	function endDrag() {
		start = null;
	}

}());