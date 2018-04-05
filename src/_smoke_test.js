// Copyright (c) 2012-2018 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global document, window, CSSRule */
/*jshint regexp:false*/

// CONSIDER THESE ALTERNATIVES TO SELENIUM:
// http://www.letscodejavascript.com/v3/comments/live/242#comment-2483111382


(function() {
	"use strict";

	const http = require("http");
	const webdriver = require('selenium-webdriver');
	const By = webdriver.By;
	const until = webdriver.until;
	const runServer = require("./_run_server.js");
	const assert = require("_assert");

	const EXPECTED_BROWSER = "firefox 59.0.2";

	const HOME_PAGE_URL = "http://localhost:5000";
	const NOT_FOUND_PAGE_URL = "http://localhost:5000/xxx";
	const GHOST_POINTER_SELECTOR = ".ghost-pointer";
	const DRAWING_AREA_ID = "drawing-area";
	const TIMEOUT = 10 * 1000;

	let serverProcess;
	let browser1;

	describe("Smoke test", function() {
		/*eslint no-invalid-this:off */
		this.timeout(30 * 1000);

		before(function (done) {
			runServer.runProgrammatically(function(process) {
				serverProcess = process;

				browser1 = createBrowserWindow();
				browser1.getCapabilities().then(function(capabilities) {
					const version = capabilities.get("browserName") + " " + capabilities.get("browserVersion");
					if (version !== EXPECTED_BROWSER) {
						console.log("Warning: Smoke test browser expected " + EXPECTED_BROWSER + ", but was " + version);
					}
					done();
				});
			});
		});

		after(function(done) {
			serverProcess.on("exit", function(code, signal) {
				browser1.quit().then(done);
			});
			serverProcess.kill();
		});

		it("can get home page", async function() {
			const { receivedData } = await httpGet(HOME_PAGE_URL);
			const foundHomePage = receivedData.indexOf("WeeWikiPaint home page") !== -1;
			assert.equal(foundHomePage, true, "home page should have contained test marker");
		});

		it("can get 404 page", async function() {
			const { receivedData } = await httpGet(HOME_PAGE_URL + "/nonexistant.html");
			const foundHomePage = receivedData.indexOf("WeeWikiPaint 404 page") !== -1;
			assert.equal(foundHomePage, true, "404 page should have contained test marker");
		});

		it("home page fonts are loaded", async function() {
			await assertWebFontsLoaded(HOME_PAGE_URL);
		});

		it("404 page fonts are loaded", async function() {
			await assertWebFontsLoaded(NOT_FOUND_PAGE_URL);
		});

		it("user can draw on page and drawing is networked", async function() {
			await browser1.get(HOME_PAGE_URL);
			const browser2 = createBrowserWindow();
			await browser2.get(HOME_PAGE_URL);

			try {
				// Check that networked browser doesn't have extraneous data
				const elements = await browser2.findElements(By.css(GHOST_POINTER_SELECTOR));
				assert.equal(elements.length, 0, "should not have any ghost pointers before pointer is moved in other browser");

				// Draw line segment
				await browser1.executeScript(function(DRAWING_AREA_ID) {
					const HtmlElement = require("./html_element.js");
					const drawingArea = HtmlElement.fromId(DRAWING_AREA_ID);
					drawingArea.triggerMouseDown(10, 20);
					drawingArea.triggerMouseMove(50, 60);
					drawingArea.triggerMouseUp(50, 60);
				}, DRAWING_AREA_ID);

				// Check that line segment appeared on browser where it was drawn
				const localLines = await getLineSegments(browser1);
				assert.deepEqual(localLines, [[10, 20, 50, 60]]);

				// Check that line segment appeared on networked browser
				await waitForNetworkedLineSegments();
				const networkLines = await getLineSegments(browser2);
				assert.deepEqual(networkLines, [[10, 20, 50, 60]]);
			}
			finally {
				await browser2.quit();
			}

			function getLineSegments(browser) {
				return browser.executeScript(function() {
					const client = require("./client.js");
					return client.drawingAreaCanvas.lineSegments();
				});
			}

			async function waitForNetworkedLineSegments() {
				await browser2.wait(function() {
					return browser2.executeScript(function() {
						const client = require("./client.js");
						return client.drawingAreaCanvas.lineSegments().length !== 0;
					});
				}, TIMEOUT, "Timed out waiting for line segments to load");
			}
		});

	});

	function createBrowserWindow() {
		return new webdriver.Builder().forBrowser("firefox").build();
	}

	async function assertWebFontsLoaded(url) {
		await browser1.get(url);
		await waitForFontsToLoad();

		const expectedFonts = await getStyleSheetFonts();
		const actualFonts = await getLoadedFonts();
		const missingFonts = determineMissingFonts(expectedFonts, actualFonts);

		if (expectedFonts.length === 0) {
			assert.fail("No web fonts found in CSS, but expected at least one.");
		}
		if (missingFonts.length !== 0) {
			console.log("Expected these fonts to be loaded, but they weren't:\n", missingFonts);
			console.log("All expected fonts:\n", expectedFonts);
			console.log("All loaded fonts:\n", actualFonts);
			assert.fail("Required fonts weren't loaded");
		}

		async function waitForFontsToLoad() {
			await browser1.wait(function() {
				return browser1.executeScript(function() {
					return window.wwp_typekitDone;
				});
			}, TIMEOUT, "Timed out waiting for web fonts to load");
		}

		async function getStyleSheetFonts() {
			const styleSheetFonts = await browser1.executeScript(browser_getStyleSheetFonts);
			return normalizeExpectedFonts(styleSheetFonts);
		}

		function getLoadedFonts() {
			return browser1.executeScript(function() {
				return window.wwp_loadedFonts;
			});
		}

		function determineMissingFonts(expectedFonts, actualFonts) {
			return expectedFonts.filter(function(expectedFont) {
				const fontPresent = actualFonts.some(function(actualFont) {
					return ('"' + actualFont.family + '"' === expectedFont.family) && (actualFont.variant === expectedFont.variant);
				});
				return !fontPresent;
			});
		}

		function normalizeExpectedFonts(styleSheetFonts) {
			const expectedFonts = [];

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
	}

	function httpGet(url) {
		return new Promise((resolve, reject) => {
			const request = http.get(url);
			request.on("response", function(response) {
				let receivedData = "";
				response.setEncoding("utf8");

				response.on("data", function(chunk) {
					receivedData += chunk;
				});
				response.on("end", function() {
					resolve({ response, receivedData });
				});
				response.on("error", reject);
			});
		});
	}

	function browser_getStyleSheetFonts() {
		// Rather than looking at stylesheet, we could descend the DOM.
		// Pros: Knows exactly which combination of fonts, weights, and styles we're using
		// Cons: It won't see all possibilities when using conditional styling such as media queries (I think)

		const styleSheetFonts = {
			families: {},
			weights: {},
			styles: {
				"normal": true
			}
		};

		const sheets = document.styleSheets;
		processAllSheets();
		return styleSheetFonts;

		function processAllSheets() {
			for (let i = 0; i < sheets.length; i++) {
				processStyleSheet(sheets[i]);
			}
		}

		function processStyleSheet(sheet) {
			if (sheet.disabled) {
				return;
			}

			const rules = getCssRulesOrNullIfSecurityError(sheet);
			if (rules === null) return;

			for (let i = 0; i < rules.length; i++) {
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
			const style = rule.style;

			processFontFamily(style.getPropertyValue("font-family"));
			processFontWeight(style.getPropertyValue("font-weight"));
			processFontStyle(style.getPropertyValue("font-style"));
		}

		function processFontFamily(familyDeclaration) {
			if (familyDeclaration === "") return;

			const families = familyDeclaration.split(",");

			families.forEach(function(family) {
				family = family.trim();
				if (family === "") return;
				if (isGenericName(family)) return;

				family = normalizeQuotes(family);
				if (isBuiltInFont(family)) return;

				styleSheetFonts.families[family] = true;
			});

			function isGenericName(family) {
				return family === "inherit" || family === "sans-serif" || family === "serif" ||
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
			if (weightDeclaration === "" || weightDeclaration === "inherit") return;

			styleSheetFonts.weights[weightDeclaration + ""] = true;
		}

		function processFontStyle(styleDeclaration) {
			if (styleDeclaration === "" || styleDeclaration === "inherit") return;

			styleSheetFonts.styles[styleDeclaration] = true;
		}
	}

}());