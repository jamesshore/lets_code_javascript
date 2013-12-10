// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*global phantom, document */

(function() {
	"use strict";

	// TODO: Laurent Bourgalt-Roy suggested a better way of smoke testing
	// using Selenium in combination with PhantomJS:
	// http://www.letscodejavascript.com/v3/comments/live/101#comment-1095901476

	var page = require("webpage").create();

	page.onConsoleMessage = function(message) {
		console.log("CONSOLE: " + message);
	};

	page.open("http://localhost:5000", function(success) {
		try {
			var error = page.evaluate(inBrowser);
			if (error) {
				console.log(error);
				phantom.exit(1);
			}
			else {
				phantom.exit(0);
			}
		}
		catch(err) {
			console.log("Exception in PhantomJS code");
			phantom.exit(1);
		}
	});

	function inBrowser() {
		try {
			var client = require("./client.js");
			var HtmlElement = require("./html_element.js");

			var drawingArea = new HtmlElement(document.getElementById("drawingArea"));
			drawingArea.triggerMouseDown(10, 20);
			drawingArea.triggerMouseMove(50, 60);
			drawingArea.triggerMouseUp(50, 60);

			var actual = JSON.stringify(client.drawingAreaCanvas.lineSegments());
			var expected = JSON.stringify([[ "10", "20", "50", "60" ]]);

			if (actual !== expected) return "lines drawn expected " + expected + " but was " + actual;
			else return null;
		}
		catch(err) {
			return "Exception in PhantomJS browser code";
		}
	}

}());