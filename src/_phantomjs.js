// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*global phantom, document, window, CSSRule */

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
			runTest(checkDrawingArea);

			runFontTest(function(err) {
				if (err) phantom.exit(1);
				else phantom.exit(0);
			});
		}
		catch(err) {
			console.log("Exception in PhantomJS code", err);
			phantom.exit(1);
		}
	});

	function runTest(browserFn) {
		var error = page.evaluate(browserFn);
		if (error) {
			console.log("error", error);
			phantom.exit(1);
		}
		return !error;
	}

	function runFontTest(callback) {
		var intervalId = setInterval(function() {
			var typekitDone = page.evaluate(function() {
				return window.wwp_typekitDone;
			});
			if (typekitDone) testFonts();
		}, 100);

		function testFonts() {
			clearInterval(intervalId);

			var expectedFonts = page.evaluate(determineExpectedFonts);
			var error = page.evaluate(checkFonts, expectedFonts);
			if (error) {
				console.log("error", error);
				phantom.exit(1);
			}
			callback(error);
		}
	}

	function determineExpectedFonts() {
		// Rather than looking at stylesheet, we could descend the DOM.
		// Pros: Knows exactly which combination of fonts, weights, and styles we're using
		// Cons: It won't see all possibilities when using conditional styling such as media queries (I think)

		var expectedFonts = {
			families: {},
			weights: {},
			styles: {
				"normal": true
			}
		};

		var sheets = document.styleSheets;
		processAllSheets();
		return expectedFonts;

		function processAllSheets() {
			for (var i = 0; i < sheets.length; i++) {
				processStyleSheet(sheets[i]);
			}
		}

		function processStyleSheet(sheet) {
			if (sheet.disabled) {
				return;
			}

			var rules = sheet.cssRules;
			if (rules === null) return;

			for (var i = 0; i < rules.length; i++) {
				processRule(rules[i]);
			}
		}

		function processRule(rule) {
			if (rule.type !== CSSRule.STYLE_RULE) return;
			var style = rule.style;

			processFontFamily(style.getPropertyValue("font-family"));
			processFontWeight(style.getPropertyValue("font-weight"));
			processFontStyle(style.getPropertyValue("font-style"));
		}

		function processFontFamily(familyDeclaration) {
			if (familyDeclaration === null) return;

			var families = familyDeclaration.split(",");
			families.forEach(function(family) {
				family = family.trim();
				if (family === "Helvetica" || family === "sans-serif") return;

				expectedFonts.families[family] = true;
			});
		}

		function processFontWeight(weightDeclaration) {
			if (weightDeclaration === null) return;

			expectedFonts.weights[weightDeclaration + ""] = true;
		}

		function processFontStyle(styleDeclaration) {
			if (styleDeclaration === null) return;

			expectedFonts.styles[styleDeclaration] = true;
		}
	}

	function checkFonts(expectedFonts) {
		try {
			Object.keys(expectedFonts.families).forEach(function(family) {
				Object.keys(expectedFonts.styles).forEach(function(style) {
					Object.keys(expectedFonts.weights).forEach(function(weight) {
						style = style[0];
						weight = weight[0];

						checkFont(family, style + weight);
					});
				});
			});
		}
		catch (err) {
			return "checkFonts() failed: " + err.stack;
		}

		function checkFont(family, variant) {
			var hasFont = window.wwp_loadedFonts.some(function(loadedFont) {
				return (loadedFont.family === family) && (loadedFont.variant === variant);
			});
			if (!hasFont) throw new Error("font not loaded: " + family + " " + variant);
		}
	}

	function checkDrawingArea() {
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