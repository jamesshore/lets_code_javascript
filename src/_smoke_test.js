// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global document, window, CSSRule */
/*jshint regexp:false*/

(function() {
	"use strict";

	var child_process = require("child_process");
	var http = require("http");
	var firefox = require("selenium-webdriver/firefox");
	var runServer = require("./_run_server.js");
	var assert = require("./shared/_assert.js");

	var HOME_PAGE_URL = "http://localhost:5000";
	var EXPECTED_BROWSER = "firefox 39.0.3";

	var serverProcess;
	var driver;

	describe("Smoke test", function() {
		this.timeout(10 * 1000);

		before(function (done) {
			runServer.runProgrammatically(function(process) {
				serverProcess = process;

				driver = new firefox.Driver();
				driver.getCapabilities().then(function(capabilities) {
					var version = capabilities.get("browserName") + " " + capabilities.get("version");
					if (version !== EXPECTED_BROWSER) {
						console.log("Warning: Smoke test browser expected " + EXPECTED_BROWSER + ", but was " + version);
					}
					done();
				});
			});
		});

		after(function(done) {
			serverProcess.on("exit", function(code, signal) {
				driver.quit().then(done);
			});
			serverProcess.kill();
		});

		it("can get home page", function(done) {
			httpGet(HOME_PAGE_URL, function(response, receivedData) {
				var foundHomePage = receivedData.indexOf("WeeWikiPaint home page") !== -1;
				assert.equal(foundHomePage, true, "home page should have contained test marker");
				done();
			});
		});

		it("can get 404 page", function(done) {
			httpGet(HOME_PAGE_URL + "/nonexistant.html", function(response, receivedData) {
				var foundHomePage = receivedData.indexOf("WeeWikiPaint 404 page") !== -1;
				assert.equal(foundHomePage, true, "404 page should have contained test marker");
				done();
			});
		});

		it("user can draw on page", function(done) {
			driver.get(HOME_PAGE_URL);

			driver.executeScript(function() {
				var client = require("./client.js");
				var HtmlElement = require("./html_element.js");

				var drawingArea = HtmlElement.fromId("drawing-area");
				drawingArea.triggerMouseDown(10, 20);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseUp(50, 60);

				return client.drawingAreaCanvas.lineSegments();
			}).then(function(lineSegments) {
				assert.deepEqual(lineSegments, [[ "10", "20", "50", "60" ]]);
			});

			driver.controlFlow().execute(done);
		});


		it("web fonts are loaded", function(done) {
			var TIMEOUT = 10 * 1000;

			driver.get(HOME_PAGE_URL);

			// wait for fonts to load
			driver.wait(function() {
				return driver.executeScript(function() {
					return window.wwp_typekitDone;
				});
			}, TIMEOUT, "Timed out waiting for web fonts to load");

			// get fonts from style sheet
			var expectedFonts;
			driver.executeScript(browser_getStyleSheetFonts)
			.then(function(returnValue) {
				expectedFonts = normalizeExpectedFonts(returnValue);
			});

			// get loaded fonts
			var actualFonts;
			driver.executeScript(function() {
				return window.wwp_loadedFonts;
			}).then(function(returnValue) {
				actualFonts = returnValue;
			});

			// check fonts
			driver.controlFlow().execute(function() {
				var fontsNotPresent = expectedFonts.filter(function(expectedFont) {
					var fontPresent = actualFonts.some(function(actualFont) {
						return ('"' + actualFont.family + '"' === expectedFont.family) && (actualFont.variant === expectedFont.variant);
					});
					return !fontPresent;
				});

				if (fontsNotPresent.length !== 0) {
					console.log("Expected these fonts to be loaded, but they weren't:\n", fontsNotPresent);
					console.log("All expected fonts:\n", expectedFonts);
					console.log("All loaded fonts:\n", actualFonts);
					assert.fail("Required fonts weren't loaded");
				}

				done();
			});

			function normalizeExpectedFonts(styleSheetFonts) {
				var expectedFonts = [];

				Object.keys(styleSheetFonts.families).forEach(function(family) {
					Object.keys(styleSheetFonts.styles).forEach(function(style) {
						Object.keys(styleSheetFonts.weights).forEach(function(weight) {
							style = style[0];
							weight = weight[0];

							expectedFonts.push({
								family: family,
								variant: style + weight
							});
						});
					});
				});
				return expectedFonts;
			}
		});

	});

	function httpGet(url, callback) {
		var request = http.get(url);
		request.on("response", function(response) {
			var receivedData = "";
			response.setEncoding("utf8");

			response.on("data", function(chunk) {
				receivedData += chunk;
			});
			response.on("end", function() {
				callback(response, receivedData);
			});
		});
	}

	function browser_getStyleSheetFonts() {
		// Rather than looking at stylesheet, we could descend the DOM.
		// Pros: Knows exactly which combination of fonts, weights, and styles we're using
		// Cons: It won't see all possibilities when using conditional styling such as media queries (I think)

		var styleSheetFonts = {
			families: {},
			weights: {},
			styles: {
				"normal": true
			}
		};

		var sheets = document.styleSheets;
		processAllSheets();
		return styleSheetFonts;

		function processAllSheets() {
			for (var i = 0; i < sheets.length; i++) {
				processStyleSheet(sheets[i]);
			}
		}

		function processStyleSheet(sheet) {
			if (sheet.disabled) {
				return;
			}

			var rules = getCssRulesOrNullIfSecurityError(sheet);
			if (rules === null) return;

			for (var i = 0; i < rules.length; i++) {
				processRule(rules[i]);
			}
		}

		function getCssRulesOrNullIfSecurityError(sheet) {
			// Reading cssRules from a different domain (typekit, in our case) causes a SecurityError on Firefox.
			// This occurs even though the CORS header Access-Control-Allow-Origin is set by Typekit.
			// So we have to squelch it here.
			try {
				return sheet.cssRules;
			}
			catch(err) {
				if (err.name === "SecurityError") return null;
				else throw err;
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
			if (familyDeclaration === "") return;

			var families = familyDeclaration.split(",");

			families.forEach(function(family) {
				family = family.trim();
				if (family === "") return;
				if (isGenericName(family)) return;

				family = normalizeQuotes(family);
				if (isBuiltInFont(family)) return;

				styleSheetFonts.families[family] = true;
			});

			function isGenericName(family) {
				return family === "sans-serif" || family === "serif" ||
					family === "monospace" || family === "cursive" || family === "fantasy";
			}

			function isBuiltInFont(family) {
				return family === '"Helvetica"' || family === '"Arial"' || family === '"Courier New"';
			}
		}

		function normalizeQuotes(family) {
			// remove quotes if present; courtesy of peterpengnz, http://stackoverflow.com/a/19156197
			family = family.replace(/"([^"]+(?="))"/g, '$1');
			// put them back
			family = '"' + family + '"';
			return family;
		}

		function processFontWeight(weightDeclaration) {
			if (weightDeclaration === "") return;

			styleSheetFonts.weights[weightDeclaration + ""] = true;
		}

		function processFontStyle(styleDeclaration) {
			if (styleDeclaration === "") return;

			styleSheetFonts.styles[styleDeclaration] = true;
		}
	}

}());