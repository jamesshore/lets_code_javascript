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

		it("provides page x and y coordinates", function() {
			var coord = HtmlCoordinate.fromPageOffset(13, 42);
			assert.deepEqual(coord.toPageOffset(), { x: 13, y: 42 });
		});

		it("converts page offsets to relative offsets", function() {
			var coord = HtmlCoordinate.fromPageOffset(10, 20);
			assert.deepEqual(coord.toRelativeOffset(element), { x: -5, y: 5 });
		});

		it("converts positions relative to one element to be relative to another", function() {
			var element2 = HtmlElement.fromHtml("<div style='position: absolute; top: 100px; left: 100px;'></div>");
			element2.appendSelfToBody();

			try {
				var coord = HtmlCoordinate.fromRelativeOffset(element2, 10, 20);
				var offset = coord.toRelativeOffset(element);
				assert.deepEqual(offset, { x: 95, y: 105 });
			}
			finally {
				element2.remove();
			}
		});

		it("converts to string for debugging purposes", function() {
			var coord = HtmlCoordinate.fromPageOffset(10, 20);
			assert.equal(coord.toString(), "[HtmlCoordinate page offset (10, 20)]");
		});

		describe("relative offset conversion", function() {

			var COLLAPSING_BODY_MARGIN = 8;

			it("'from relative offset' accounts for margin", function() {
				checkFromRelativeOffsetCalculation("margin-top: 13px;", 0, 13 - COLLAPSING_BODY_MARGIN);
				checkFromRelativeOffsetCalculation("margin-left: 13px;", 13, 0);
				checkFromRelativeOffsetCalculation("margin: 13px;", 13, 13 - COLLAPSING_BODY_MARGIN);
				checkFromRelativeOffsetCalculation("margin: 1em; font-size: 16px", 16, 16 - COLLAPSING_BODY_MARGIN);
			});

			it("'to relative offset' accounts for margin", function() {
				checkToRelativeOffsetCalculation("margin-top: 13px;", 0, 13 - COLLAPSING_BODY_MARGIN);
				checkToRelativeOffsetCalculation("margin-left: 13px;", 13, 0);
				checkToRelativeOffsetCalculation("margin: 13px;", 13, 13 - COLLAPSING_BODY_MARGIN);
				checkToRelativeOffsetCalculation("margin: 1em; font-size: 16px", 16, 16 - COLLAPSING_BODY_MARGIN);
			});

			it("fails fails fast if there is any padding", function() {
				expectFailFast("padding-top: 13px;");
				expectFailFast("padding-left: 13px;");
				expectFailFast("padding: 13px;");
				expectFailFast("padding: 1em; font-size: 16px");

				// IE 8 weirdness
				expectFailFast("padding-top: 20%");
				expectFailFast("padding-left: 20%");
			});

			it("fails fast if there is any border", function() {
				expectFailFast("border-top: 13px solid;");
				expectFailFast("border-left: 13px solid;");
				expectFailFast("border: 13px solid;");
				expectFailFast("border: 1em solid; font-size: 16px");

				// IE 8 weirdness
				expectFailFast("border: thin solid");
				expectFailFast("border: medium solid");
				expectFailFast("border: thick solid");
				checkFromRelativeOffsetCalculation("border: 13px none", 0, 0);
				checkToRelativeOffsetCalculation("border: 13px none", 0, 0);
			});

			function expectFailFast(elementStyle) {
				var styledElement = HtmlElement.fromHtml("<div style='" + elementStyle + "'></div>");
				try {
					styledElement.appendSelfToBody();
					assert.throws(function() {
						HtmlCoordinate.fromRelativeOffset(styledElement,  100, 150);
					});
					assert.throws(function() {
						HtmlCoordinate.fromPageOffset(100, 150).toRelativeOffset(styledElement);
					});
				}
				finally {
					styledElement.remove();
				}
			}

			function checkFromRelativeOffsetCalculation(elementStyle, additionalXOffset, additionalYOffset) {
				var BASE_STYLE = "width: 120px; height: 80px; border: 0px none;";

				var unstyledElement = HtmlElement.fromHtml("<div style='" + BASE_STYLE + "'></div>");
				unstyledElement.appendSelfToBody();
				var expectedCoord = HtmlCoordinate.fromRelativeOffset(
					unstyledElement,
					100 + additionalXOffset,
					150 + additionalYOffset
				);
				unstyledElement.remove();

				var styledElement = HtmlElement.fromHtml("<div style='" + BASE_STYLE + elementStyle + "'></div>");
				try {
					styledElement.appendSelfToBody();
					var actualCoord = HtmlCoordinate.fromRelativeOffset(styledElement, 100, 150);
					assert.objEqual(expectedCoord, actualCoord);
				}
				finally {
					styledElement.remove();
				}
			}

			function checkToRelativeOffsetCalculation(elementStyle, additionalXOffset, additionalYOffset) {
				var BASE_STYLE = "width: 120px; height: 80px; border: 0px none;";

				var unstyledElement = HtmlElement.fromHtml("<div style='" + BASE_STYLE + "'></div>");
				unstyledElement.appendSelfToBody();
				var expectedOffset = HtmlCoordinate.fromPageOffset(
					100 - additionalXOffset,
					150 - additionalYOffset
				).toRelativeOffset(unstyledElement);
				unstyledElement.remove();

				var styledElement = HtmlElement.fromHtml("<div style='" + BASE_STYLE + elementStyle + "'></div>");
				try {
					styledElement.appendSelfToBody();
					var actualOffset = HtmlCoordinate.fromPageOffset(100, 150).toRelativeOffset(styledElement);
					assert.deepEqual(expectedOffset, actualOffset);
				}
				finally {
					styledElement.remove();
				}
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