// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global Raphael */

window.wwp = window.wwp || {};

(function() {
	"use strict";

	var svgCanvas = null;
	var start = null;
	var drawingArea;

	wwp.initializeDrawingArea = function(htmlElement) {
		if (svgCanvas !== null) throw new Error("Client.js is not re-entrant");
		drawingArea = htmlElement;

		svgCanvas = new wwp.SvgCanvas(drawingArea);
		handleDragEvents();
		return svgCanvas;
	};

	wwp.drawingAreaHasBeenRemovedFromDom = function() {
		svgCanvas = null;
	};

	function handleDragEvents() {
		preventDefaults();

		drawingArea.onMouseDown(startDrag);
		drawingArea.onMouseMove(continueDrag);
		drawingArea.onMouseLeave(endDrag);
		drawingArea.onMouseUp(endDrag);

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

	function startDrag(offset) {
		start = offset;
	}

	function continueDrag(relativeOffset) {
		if (start === null) return;

		var end = relativeOffset;
		svgCanvas.drawLine(start.x, start.y, end.x, end.y);
		start = end;
	}

	function endDrag() {
		start = null;
	}

}());