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