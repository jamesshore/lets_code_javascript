// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("../../shared/_assert.js");
	var HtmlCoordinate = require("./html_coordinate.js");
	var HtmlElement = require("./html_element.js");

	describe("UI: HtmlCoordinates", function() {

		var element;

		beforeEach(function() {
			element = HtmlElement.fromHtml("<div id='element'></div>");
			element.appendSelfToBody();
		});

		afterEach(function() {
			element.remove();
		});

		it("are equal when based on the same data", function() {
			var coord1 = HtmlCoordinate.fromRelativeCoords(element, 10, 20);
			var coord2 = HtmlCoordinate.fromRelativeCoords(element, 10, 20);

			assert.equal(coord1.equals(coord2), true);
		});

		it("are equal when HtmlElement is different but the underlying DOM element is the same", function() {
			var coord1 = HtmlCoordinate.fromRelativeCoords(element, 10, 20);
			var coord2 = HtmlCoordinate.fromRelativeCoords(HtmlElement.fromId("element"), 10, 20);

			assert.equal(coord1.equals(coord2), true);
		});

		it("are different when elements are different", function() {
			var coord1 = HtmlCoordinate.fromRelativeCoords(element, 10, 20);
			var coord2 = HtmlCoordinate.fromRelativeCoords(HtmlElement.fromHtml("<div></div>"), 10, 20);

			assert.equal(coord1.equals(coord2), false);
		});

		it("are different when x values are different", function() {
			var coord1 = HtmlCoordinate.fromRelativeCoords(element, 10, 20);
			var coord2 = HtmlCoordinate.fromRelativeCoords(element, 15, 20);

			assert.equal(coord1.equals(coord2), false);
		});

		it("are different when y values are different", function() {
			var coord1 = HtmlCoordinate.fromRelativeCoords(element, 10, 20);
			var coord2 = HtmlCoordinate.fromRelativeCoords(element, 10, 25);

			assert.equal(coord1.equals(coord2), false);
		});

	});

}());