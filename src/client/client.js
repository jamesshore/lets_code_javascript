// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global dump, Raphael, wwp:true*/

wwp = {};

(function() {
	"use strict";

		wwp.initializeDrawingArea = function(drawingAreaElement) {
			var paper = new Raphael(drawingAreaElement);
			return paper;
		};

}());