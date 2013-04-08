// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global Raphael */

window.wwp = window.wwp || {};

(function() {
	"use strict";

	var paper = null;
	var start = null;
	var drawingArea;

	wwp.initializeDrawingArea = function(htmlElement) {
		if (paper !== null) throw new Error("Client.js is not re-entrant");
		drawingArea = htmlElement;

		paper = new Raphael(drawingArea._element[0]);
		handleDragEvents();
		return paper;
	};

	wwp.drawingAreaHasBeenRemovedFromDom = function() {
		paper = null;
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
		drawLine(start.x, start.y, end.x, end.y);
		start = end;
	}

	function endDrag() {
		start = null;
	}

	function drawLine(startX, startY, endX, endY) {
		paper.path("M" + startX + "," + startY + "L" + endX + "," + endY);
	}

}());