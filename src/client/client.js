// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global dump, Raphael, $, wwp:true*/

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

		$(document).mousedown(function(event) {
			start = relativeOffset(drawingArea, event.pageX, event.pageY);
		});

		drawingArea.mousemove(function(event) {
			if (start === null) return;

			var end = relativeOffset(drawingArea, event.pageX, event.pageY);
			drawLine(start.x, start.y, end.x, end.y);
			start = end;
		});

		$(document).mouseup(function(event) {
			start = null;
		});
	}

	function drawLine(startX, startY, endX, endY) {
		paper.path("M" + startX + "," + startY + "L" + endX + "," + endY);
	}

	function relativeOffset(element, absoluteX, absoluteY) {
		var pageOffset = element.offset();

		return {
			x: absoluteX - pageOffset.left,
			y: absoluteY - pageOffset.top
		};
	}

}());