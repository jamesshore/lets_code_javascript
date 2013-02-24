// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global dump, Raphael, $, wwp:true, Event*/

wwp = {};

(function() {
	"use strict";

	var paper = null;
	var start = null;

	wwp.initializeDrawingArea = function(drawingAreaElement) {
		if (paper !== null) throw new Error("Client.js is not re-entrant");

		paper = new Raphael(drawingAreaElement);
		handleDragEvents(drawingAreaElement);
		return paper;
	};

	wwp.drawingAreaHasBeenRemovedFromDom = function() {
		paper = null;
	};

	function handleDragEvents(drawingAreaElement) {
		var drawingArea = $(drawingAreaElement);

		drawingArea.on("selectstart", function(event) {
			// This event handler is needed so IE 8 doesn't select text when you drag outside drawing area
			event.preventDefault();
		});

		drawingArea.mousedown(function(event) {
			event.preventDefault();
			startDrag(drawingArea, event.pageX, event.pageY);
		});

		drawingArea.mousemove(function(event) {
			continueDrag(drawingArea, event.pageX, event.pageY);
		});

		drawingArea.mouseleave(function(event) {
			endDrag();
		});

		drawingArea.mouseup(function(event) {
			endDrag();
		});

		drawingArea.on("touchstart", function(event) {
			event.preventDefault();
			var originalEvent = event.originalEvent;

			if (originalEvent.touches.length !== 1) {
				start = null;
				return;
			}

			var pageX = originalEvent.touches[0].pageX;
			var pageY = originalEvent.touches[0].pageY;

			startDrag(drawingArea, pageX, pageY);
		});

		drawingArea.on("touchmove", function(event) {
			var originalEvent = event.originalEvent;

			var pageX = originalEvent.touches[0].pageX;
			var pageY = originalEvent.touches[0].pageY;

			continueDrag(drawingArea, pageX, pageY);
		});

		drawingArea.on("touchend", function(event) {
			endDrag();
		});

		drawingArea.on("touchcancel", function(event) {
			endDrag();
		});
	}

	function startDrag(drawingArea, pageX, pageY) {
		var offset = relativeOffset(drawingArea, pageX, pageY);
		start = offset;
	}

	function continueDrag(drawingArea, pageX, pageY) {
		if (start === null) return;

		var end = relativeOffset(drawingArea, pageX, pageY);
		drawLine(start.x, start.y, end.x, end.y);
		start = end;
	}

	function endDrag() {
		start = null;
	}

	function drawLine(startX, startY, endX, endY) {
		paper.path("M" + startX + "," + startY + "L" + endX + "," + endY);
	}

	function relativeOffset(element, pageX, pageY) {
		var pageOffset = element.offset();

		return {
			x: pageX - pageOffset.left,
			y: pageY - pageOffset.top
		};
	}

}());