// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("../../shared/_assert.js");
	var HtmlCoordinate = require("./html_coordinate.js");
	var HtmlElement = require("./html_element.js");

	describe("UI: HtmlCoordinate", function() {

		var element;

		beforeEach(function() {
			element = HtmlElement.fromHtml("<div id='element'></div>");
			element.appendSelfToBody();
		});

		afterEach(function() {
			element.remove();
		});

		it("provides relative x and y coordinates", function() {
			var coord = HtmlCoordinate.fromRelativeOffset(element, 10, 20);
			assert.equal(coord.toRelativeX(element), 10, "x");
			assert.equal(coord.toRelativeY(element), 20, "y");
		});

		it("converts page offsets to relative coordinates", function() {
			var coord = HtmlCoordinate.fromPageOffset(element, 10, 20);
			assert.equal(coord.toRelativeX(element), 2, "x");
			assert.equal(coord.toRelativeY(element), 12, "y");
		});

		it("converts to string for debugging purposes", function() {
			var coord = HtmlCoordinate.fromRelativeOffset(element, 10, 20);
			assert.equal(coord.toString(), "[HtmlCoordinate (10, 20) relative to <div>]");
		});

		describe("equality", function() {

			it("is equal when based on the same data", function() {
				var coord1 = HtmlCoordinate.fromRelativeOffset(element, 10, 20);
				var coord2 = HtmlCoordinate.fromRelativeOffset(element, 10, 20);

				assert.objEqual(coord1, coord2);
			});

			it("is equal when HtmlElement is different but the underlying DOM element is the same", function() {
				var coord1 = HtmlCoordinate.fromRelativeOffset(element, 10, 20);
				var coord2 = HtmlCoordinate.fromRelativeOffset(HtmlElement.fromId("element"), 10, 20);

				assert.objEqual(coord1, coord2);
			});

			it("is not equal when elements are different", function() {
				var coord1 = HtmlCoordinate.fromRelativeOffset(element, 10, 20);
				var coord2 = HtmlCoordinate.fromRelativeOffset(HtmlElement.fromHtml("<div></div>"), 10, 20);

				assert.objNotEqual(coord1, coord2);
			});

			it("is not equal when x values are different", function() {
				var coord1 = HtmlCoordinate.fromRelativeOffset(element, 10, 20);
				var coord2 = HtmlCoordinate.fromRelativeOffset(element, 15, 20);

				assert.objNotEqual(coord1, coord2);
			});

			it("is not equal when y values are different", function() {
				var coord1 = HtmlCoordinate.fromRelativeOffset(element, 10, 20);
				var coord2 = HtmlCoordinate.fromRelativeOffset(element, 10, 25);

				assert.objNotEqual(coord1, coord2);
			});

		});
	});

}());