// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*global phantom, document, window */

(function() {
	"use strict";

	// TODO: Laurent Bourgalt-Roy suggested a better way of smoke testing
	// using Selenium in combination with PhantomJS:
	// http://www.letscodejavascript.com/v3/comments/live/101#comment-1095901476

	var page = require("webpage").create();

	page.onConsoleMessage = function(message) {
		console.log("CONSOLE: " + message);
	};

	page.onInitialized = function () {
		page.evaluate(function () {
			var typekitConfig = window.__typekitConfig = {};
			var fonts = [];

			typekitConfig.fontactive = function fontactive(family, variant) {
				fonts.push({
					family: family,
					variant: variant
				});
			};

			typekitConfig.active = typekitConfig.inactive = function done() {
				window.callPhantom(fonts);
			};
		});
	};

	page.onCallback = function (loadedFonts) {
		var error = page.evaluate(checkFonts, loadedFonts);
		if (error) {
			console.log("error", error);
			phantom.exit(1);
		}
		else {
			phantom.exit(0);
		}
	};

	page.open("http://localhost:5000", function(success) {
		try {
			var error = page.evaluate(inBrowser);
			if (error) {
				console.log(error);
				phantom.exit(1);
			}
		}
		catch(err) {
			console.log("Exception in PhantomJS code", err);
			phantom.exit(1);
		}
	});

	function checkFonts(loadedFonts) {
		try {
			checkFont(loadedFonts, "alwyn-new-rounded-web", "n3");
			checkFont(loadedFonts, "alwyn-new-rounded-web", "n4");
			checkFont(loadedFonts, "alwyn-new-rounded-web", "n6");
		}
		catch (err) {
			return "checkFonts() failed: " + err.stack;
		}

		function checkFont(loadedFonts, family, variant) {
			var hasFont = loadedFonts.some(function(loadedFont) {
				return (loadedFont.family === family) && (loadedFont.variant === variant);
			});
			if (!hasFont) throw new Error("font not loaded: " + family + " " + variant);
			else console.log("font loaded: " + family + " " + variant);
		}
	}

	function inBrowser() {
		try {
			var client = require("./client.js");
			var HtmlElement = require("./html_element.js");

			var drawingArea = HtmlElement.fromId("drawing-area");
			drawingArea.triggerMouseDown(10, 20);
			drawingArea.triggerMouseMove(50, 60);
			drawingArea.triggerMouseUp(50, 60);

			var actual = JSON.stringify(client.drawingAreaCanvas.lineSegments());
			var expected = JSON.stringify([[ "10", "20", "50", "60" ]]);

			if (actual !== expected) return "lines drawn expected " + expected + " but was " + actual;
			else return null;
		}
		catch(err) {
			return "Exception in PhantomJS browser code: " + err.stack;
		}
	}

}());
