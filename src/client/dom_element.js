// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global wwp:true */

window.wwp = window.wwp || {};

(function() {
	"use strict";

	wwp.relativeOffset = function(element, pageX, pageY) {
		var pageOffset = element.offset();

		return {
			x: pageX - pageOffset.left,
			y: pageY - pageOffset.top
		};
	};

	wwp.pageOffset = function(drawingArea, relativeX, relativeY) {
		var topLeftOfDrawingArea = drawingArea.offset();
		return {
			x: relativeX + topLeftOfDrawingArea.left,
			y: relativeY + topLeftOfDrawingArea.top
		};
	};

}());