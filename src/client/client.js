// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global dump, Raphael, $, wwp:true, Event*/

wwp = {};

(function() {
	"use strict";

	var paper;

	wwp.initializeDrawingArea = function(drawingAreaElement) {
		paper = new Raphael(drawingAreaElement);
		handleDragEvents(drawingAreaElement);
		return paper;
	};

	function handleDragEvents(drawingAreaElement) {
		var drawingArea = $(drawingAreaElement);
		var start = null;

		drawingArea.mousedown(function(event) {
			event.preventDefault();
			var offset = relativeOffset(drawingArea, event.pageX, event.pageY);
			start = offset;
		});

		drawingArea.on("selectstart", function(event) {
			// This event handler is needed so IE 8 doesn't select text when you drag outside drawing area
			event.preventDefault();
		});

		drawingArea.mousemove(function(event) {
			if (start === null) return;

			var end = relativeOffset(drawingArea, event.pageX, event.pageY);
			drawLine(start.x, start.y, end.x, end.y);
			start = end;
		});

		drawingArea.mouseleave(function(event) {
			start = null;
		});

		drawingArea.mouseup(function(event) {
			start = null;
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

			var offset = relativeOffset(drawingArea, pageX, pageY);
			start = offset;
		});

		drawingArea.on("touchmove", function(event) {
			if (start === null) return;

			var originalEvent = event.originalEvent;

			var pageX = originalEvent.touches[0].pageX;
			var pageY = originalEvent.touches[0].pageY;

			var end = relativeOffset(drawingArea, pageX, pageY);
			drawLine(start.x, start.y, end.x, end.y);
			start = end;
		});

		drawingArea.on("touchend", function(event) {
			start = null;
		});


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