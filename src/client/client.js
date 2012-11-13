// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global dump, Raphael, wwp:true*/

wwp = {};

(function() {
	"use strict";

		var paper;

		wwp.initializeDrawingArea = function(drawingAreaElement) {
			paper = new Raphael(drawingAreaElement);
			return paper;
		};

		wwp.drawLine = function(startX, startY, endX, endY) {
			paper.path("M" + startX + "," + startY + "L" + endX + "," + endY);
		};

}());