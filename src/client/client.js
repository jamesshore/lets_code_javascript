// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global dump, Raphael, $, wwp:true, Event*/

window.wwp = window.wwp || {};

(function() {
	"use strict";

	var paper = null;
	var start = null;
	var domElement;

	wwp.initializeDrawingArea = function(drawingAreaElement) {
		if (paper !== null) throw new Error("Client.js is not re-entrant");
		domElement = new wwp.DomElement($(drawingAreaElement));

		paper = new Raphael(drawingAreaElement);
		handleDragEvents(drawingAreaElement);
		return paper;
	};

	wwp.drawingAreaHasBeenRemovedFromDom = function() {
		paper = null;
	};

	function handleDragEvents(drawingAreaElement) {
		preventDefaults();

		domElement.onMouseDown(startDrag);
		domElement.onMouseMove(continueDrag);
		domElement.onMouseLeave(endDrag);
		domElement.onMouseUp(endDrag);

		domElement.onSingleTouchStart(startDrag);
		domElement.onSingleTouchMove(continueDrag);
		domElement.onSingleTouchEnd(endDrag);
		domElement.onSingleTouchCancel(endDrag);

		domElement.onMultiTouchStart(endDrag);
	}

	function preventDefaults() {
		domElement.onSelectStart_ie8Only(function(event) {
			// This event handler is needed so IE 8 doesn't select text when you drag outside drawing area
			event.preventDefault();
		});

		domElement.onMouseDown(function(relativeOffset, event) {
			event.preventDefault();
		});

		domElement.onSingleTouchStart(function(relativeOffset, event) {
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