// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global dump, Raphael, $, wwp:true*/

wwp = {};

(function() {
	"use strict";

		var paper;

		wwp.initializeDrawingArea = function(drawingAreaElement) {
			paper = new Raphael(drawingAreaElement);
			console.log("init");
			$(drawingAreaElement).click(function(event) {
				// TODO in test: account for padding, border, margin
				var divPageX = $(drawingAreaElement).offset().left;
				var divPageY = $(drawingAreaElement).offset().top;

				var relativeX = event.pageX - divPageX;
				var relativeY = event.pageY - divPageY;
				console.log(event);
				wwp.drawLine(0, 0, relativeX, relativeY);
			});
			return paper;
		};

		wwp.drawLine = function(startX, startY, endX, endY) {
			paper.path("M" + startX + "," + startY + "L" + endX + "," + endY);
		};

}());