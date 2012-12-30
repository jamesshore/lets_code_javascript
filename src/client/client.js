// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global dump, Raphael, $, wwp:true*/

wwp = {};

(function() {
	"use strict";

		var paper;

		wwp.initializeDrawingArea = function(drawingAreaElement) {
			var start = null;

			paper = new Raphael(drawingAreaElement);

			$(document).mousedown(function(event) {
				start = relativeOffset(drawingArea, event.pageX, event.pageY);
			});
			$(document).mouseup(function(event) {
				start = null;
			});

			var drawingArea = $(drawingAreaElement);
			drawingArea.mousemove(function(event) {
				if (start === null) return;

				var end = relativeOffset(drawingArea, event.pageX, event.pageY);
				wwp.drawLine(start.x, start.y, end.x, end.y);
				start = end;
			});
			return paper;
		};

		wwp.drawLine = function(startX, startY, endX, endY) {
			paper.path("M" + startX + "," + startY + "L" + endX + "," + endY);
		};

	function relativeOffset(element, absoluteX, absoluteY) {
		var pageOffset = element.offset();

		return {
			x: absoluteX - pageOffset.left,
			y: absoluteY - pageOffset.top
		};
	}

}());