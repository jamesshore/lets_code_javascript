// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("../../shared/_assert.js");
	var HtmlCoordinate = require("./html_coordinate.js");
	var HtmlElement = require("./html_element.js");

	describe("UI: HtmlCoordinate", function() {

		var element;

		beforeEach(function() {
			element = HtmlElement.fromHtml("<div id='element' style='position: absolute; top: 15px; left: 15px;'></div>");
			element.appendSelfToBody();
		});

		afterEach(function() {
			element.remove();
		});

		it("provides relative x and y coordinates", function() {
			var coord = HtmlCoordinate.fromRelativeOffset(element, 10, 20);
			assert.deepEqual(coord.toRelativeOffset(element), { x: 10, y: 20 });
		});

		it("converts page offsets to relative offsets", function() {
			var coord = HtmlCoordinate.fromPageOffset(10, 20);
			assert.deepEqual(coord.toRelativeOffset(element), { x: -5, y: 5 });
		});

		it("converts positions relative to one element to be relative to another", function() {
			var element2 = HtmlElement.fromHtml("<div style='position: absolute; top: 100px; left: 100px;'></div>");
			element2.appendSelfToBody();

			var coord = HtmlCoordinate.fromRelativeOffset(element2, 10, 20);
			var offset = coord.toRelativeOffset(element);
			assert.deepEqual(offset, { x: 95, y: 105 });
		});

		it("converts to string for debugging purposes", function() {
			var coord = HtmlCoordinate.fromPageOffset(10, 20);
			assert.equal(coord.toString(), "[HtmlCoordinate page offset (10, 20)]");
		});

		describe("coordinate conversion", function() {

			var COLLAPSING_BODY_MARGIN = 8;

			it("page coordinate conversion accounts for margin", function() {
				checkRelativeStyle("margin-top: 13px;", 0, 13 - COLLAPSING_BODY_MARGIN);
				checkRelativeStyle("margin-left: 13px;", 13, 0);
				checkRelativeStyle("margin: 13px;", 13, 13 - COLLAPSING_BODY_MARGIN);
				checkRelativeStyle("margin: 1em; font-size: 16px", 16, 16 - COLLAPSING_BODY_MARGIN);
			});

			it("relative coordinate conversion accounts for margin", function() {
				checkPageStyle("margin-top: 13px;", 0, 13 - COLLAPSING_BODY_MARGIN);
				checkPageStyle("margin-left: 13px;", 13, 0);
				checkPageStyle("margin: 13px;", 13, 13 - COLLAPSING_BODY_MARGIN);
				checkPageStyle("margin: 1em; font-size: 16px", 16, 16 - COLLAPSING_BODY_MARGIN);
			});

			it("page coordinate conversion fails fast if there is any padding", function() {
				expectFailFast("padding-top: 13px;");
				expectFailFast("padding-left: 13px;");
				expectFailFast("padding: 13px;");
				expectFailFast("padding: 1em; font-size: 16px");

				// IE 8 weirdness
				expectFailFast("padding-top: 20%");
				expectFailFast("padding-left: 20%");
			});

			it("page coordinate conversion fails fast if there is any border", function() {
				expectFailFast("border-top: 13px solid;");
				expectFailFast("border-left: 13px solid;");
				expectFailFast("border: 13px solid;");
				expectFailFast("border: 1em solid; font-size: 16px");

				// IE 8 weirdness
				expectFailFast("border: thin solid");
				expectFailFast("border: medium solid");
				expectFailFast("border: thick solid");
				checkRelativeStyle("border: 13px none", 0, 0);
				checkPageStyle("border: 13px none", 0, 0);
			});

			function expectFailFast(elementStyle) {
				var styledElement = HtmlElement.fromHtml("<div style='" + elementStyle + "'></div>");
				try {
					styledElement.appendSelfToBody();
					assert.throws(function() {
						styledElement.relativeOffset({ x: 100, y: 150 });
					});
					assert.throws(function() {
						styledElement.pageOffset({ x: 100, y: 150 });
					});
				}
				finally {
					styledElement.remove();
				}
			}

			function checkRelativeStyle(elementStyle, additionalXOffset, additionalYOffset) {
				var BASE_STYLE = "width: 120px; height: 80px; border: 0px none;";

				var unstyledElement = HtmlElement.fromHtml("<div style='" + BASE_STYLE + "'></div>");
				unstyledElement.appendSelfToBody();
				var unstyledOffset = unstyledElement.relativeOffset({x: 100, y: 150});

				var unstyledCoord = HtmlCoordinate.fromRelativeOffset(unstyledElement, 100, 150);

				unstyledElement.remove();

				var styledElement = HtmlElement.fromHtml("<div style='" + BASE_STYLE + elementStyle + "'></div>");
				try {
					styledElement.appendSelfToBody();

					var styledCoord = HtmlCoordinate.fromRelativeOffset(styledElement, 100, 150);

					var styledOffset = styledElement.relativeOffset({x: 100, y: 150});

					assert.objEqual(unstyledCoord, styledCoord);

					assertRelativeOffsetEquals(
						styledOffset,
						unstyledOffset.x - additionalXOffset,
						unstyledOffset.y - additionalYOffset
					);
				}
				finally {
					styledElement.remove();
				}
			}

			function checkPageStyle(elementStyle, additionalXOffset, additionalYOffset) {
				var BASE_STYLE = "width: 120px; height: 80px; border: 0px none;";

				var unstyledElement = HtmlElement.fromHtml("<div style='" + BASE_STYLE + "'></div>");
				unstyledElement.appendSelfToBody();
				var unstyledOffset = unstyledElement.pageOffset({x: 100, y: 150});
				unstyledElement.remove();

				var styledElement = HtmlElement.fromHtml("<div style='" + BASE_STYLE + elementStyle + "'></div>");
				try {
					styledElement.appendSelfToBody();
					var styledOffset = styledElement.pageOffset({x: 100, y: 150});
					assertRelativeOffsetEquals(
						styledOffset,
						unstyledOffset.x + additionalXOffset,
						unstyledOffset.y + additionalYOffset
					);
				}
				finally {
					styledElement.remove();
				}
			}

			function assertRelativeOffsetEquals(actualOffset, expectedX, expectedY) {
				assert.deepEqual(actualOffset, {x: expectedX, y: expectedY});
			}

			function assertPageOffsetEquals(actualOffset, expectedX, expectedY) {
				assert.deepEqual(actualOffset, {x: expectedX, y: expectedY});
			}

		});

		describe("equality", function() {

			it("is equal when based on the same page data", function() {
				var coord1 = HtmlCoordinate.fromPageOffset(25, 35);
				var coord2 = HtmlCoordinate.fromRelativeOffset(element, 10, 20);

				assert.objEqual(coord1, coord2);
			});

			it("is not equal when x values are different", function() {
				var coord1 = HtmlCoordinate.fromPageOffset(10, 20);
				var coord2 = HtmlCoordinate.fromPageOffset(15, 20);

				assert.objNotEqual(coord1, coord2);
			});

			it("is not equal when y values are different", function() {
				var coord1 = HtmlCoordinate.fromPageOffset(10, 20);
				var coord2 = HtmlCoordinate.fromPageOffset(10, 25);

				assert.objNotEqual(coord1, coord2);
			});

		});
	});

}());