// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global document, window, CSSRule */
/*jshint regexp:false*/

(function() {
	"use strict";

	var child_process = require("child_process");
	var http = require("http");
	var phantomjs = require("phantomjs");
	var firefox = require("selenium-webdriver/firefox");

	var runServer = require("./_run_server.js");

	var HOME_PAGE_URL = "http://localhost:5000";

	var serverProcess;
	var driver;

	exports.test_setupOnce = function(test) {
		runServer.runProgrammatically(function(process) {
			serverProcess = process;

			driver = new firefox.Driver();

			test.done();
		});
	};

	exports.test_canGetHomePage = function(test) {
		httpGet(HOME_PAGE_URL, function(response, receivedData) {
			var foundHomePage = receivedData.indexOf("WeeWikiPaint home page") !== -1;
			test.ok(foundHomePage, "home page should have contained test marker");
			test.done();
		});
	};

	exports.test_canGet404Page = function(test) {
		httpGet(HOME_PAGE_URL + "/nonexistant.html", function(response, receivedData) {
			var foundHomePage = receivedData.indexOf("WeeWikiPaint 404 page") !== -1;
			test.ok(foundHomePage, "404 page should have contained test marker");
			test.done();
		});
	};

	exports.test_userCanDrawOnPage = function(test) {
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
			test.deepEqual(lineSegments, [[ "10", "20", "50", "60" ]]);
		});

		driver.controlFlow().execute(test.done);
	};

	exports.test_webFontsAreLoaded = function(test) {
		var TIMEOUT = 10 * 1000;

		driver.get(HOME_PAGE_URL);

		driver.wait(function() {
			return driver.executeScript(function() {
				return window.wwp_typekitDone;
			});
		}, TIMEOUT, "Timed out waiting for web fonts to load");

		driver.executeScript(function() {
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

			try {
				var sheets = document.styleSheets;
				processAllSheets();
				checkFonts(expectedFonts);
			}
			catch (err) {
				return err + "\n" + err.stack;
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

			function processAllSheets() {
				for (var i = 0; i < sheets.length; i++) {
					processStyleSheet(sheets[i]);
				}
			}

			function processStyleSheet(sheet) {
				if (sheet.disabled) {
					return;
				}

				var rules = sheet.cssRules;     // THROWS EXCEPTION: how do we fix this?
				var rules = null;
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

		}).then(function(returnValue) {
			console.log(returnValue);
		});

		driver.controlFlow().execute(test.done);
	};

	//exports.test_userCanDrawOnPage = function(test) {
	//	var phantomJsProcess = child_process.spawn(phantomjs.path, ["src/_phantomjs.js"], { stdio: "inherit" });
	//	phantomJsProcess.on("exit", function(code) {
	//		test.equals(code, 0, "PhantomJS test failures");
	//		test.done();
	//	});
	//};

	var tearDownNow = false;
	exports.test_tearDownOnce = function(test) {
		tearDownNow = true;
		test.done();
	};
	exports.tearDown = function(done) {
		if (!tearDownNow) return done();
		if (!serverProcess) return done();

		serverProcess.on("exit", function(code, signal) {
			driver.quit().then(done);
		});
		serverProcess.kill();
	};

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

}());