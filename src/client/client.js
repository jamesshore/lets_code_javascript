// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global dump, Raphael, $, wwp:true*/

wwp = {};

(function() {
	"use strict";

		var paper;

		wwp.initializeDrawingArea = function(drawingAreaElement) {
			paper = new Raphael(drawingAreaElement);

			var drawingArea = $(drawingAreaElement);
			drawingArea.click(function(event) {
				var topLeft = drawingArea.offset();
				var topBorder = parseInt(drawingArea.css("border-top-width"), 10);
				var leftBorder = parseInt(drawingArea.css("border-left-width"), 10);

				dump(topBorder);

				wwp.drawLine(0, 0, event.pageX - topLeft.left, event.pageY - topLeft.top);
			});

//			var prevX = null;
//			var prevY = null;
//
//			var jqArea = $(drawingAreaElement);
//
//			var isDragging = false;
//
//
//			// TODO in test: if mouse clicked when outside of element, or let go outside of element,
//			// then the 'isDragging' state could get stuck
//			$(document).mousedown(function(event) {
//				isDragging = true;
//			});
//			$(document).mouseup(function(event) {
//				isDragging = false;
//			});
//
//			jqArea.mousemove(function(event) {
//				// TODO in test: account for padding, border, margin (manual tests too)
//				var divPageX = jqArea.offset().left;
//				var divPageY = jqArea.offset().top;
//
//				var relativeX = event.pageX - divPageX;
//				var relativeY = event.pageY - divPageY;
//
//				if (prevX !== null && isDragging) wwp.drawLine(prevX, prevY, relativeX, relativeY);
//				prevX = relativeX;
//				prevY = relativeY;
//			});
			return paper;
		};

		wwp.drawLine = function(startX, startY, endX, endY) {
			paper.path("M" + startX + "," + startY + "L" + endX + "," + endY);
		};

}());