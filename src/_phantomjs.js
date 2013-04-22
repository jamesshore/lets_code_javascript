// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*global phantom, wwp, $ */

(function() {
	"use strict";

	var page = require("webpage").create();

	page.onConsoleMessage = function(message) {
		console.log("CONSOLE: " + message);
	};

	page.open("http://localhost:5000", function(success) {
		page.evaluate(inBrowser);
		phantom.exit(0);
	});

	function inBrowser() {
		var drawingArea = new wwp.HtmlElement($("#drawingArea"));
		drawingArea.doMouseDown(10, 20);
		drawingArea.doMouseMove(50, 60);
		drawingArea.doMouseUp(50, 60);

		var svgCanvas = new wwp.SvgCanvas(drawingArea);
		console.log(JSON.stringify(svgCanvas.lineSegments()));

		function isDefined(obj) {
			return typeof(obj) !== "undefined";
		}
	}

}());