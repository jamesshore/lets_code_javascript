// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global describe, it, expect, dump, $, wwp, afterEach*/

(function() {
	"use strict";

	describe("Drawing area", function() {

		afterEach(function() {
			$("#wwp-drawingArea").remove();
		});

		it("should be initialized with Raphael", function() {
			// create div that's assumed to be in our home page
			var div = document.createElement("div");
			div.setAttribute("id", "wwp-drawingArea");
			document.body.appendChild(div);

			// initialize it (production code)
			wwp.initializeDrawingArea("wwp-drawingArea");

			// verify it was initialized correctly
			var tagName = $(div).children()[0].tagName.toLowerCase();
			if (tagName === "svg") {
				// We're in a browser that supports SVG
				expect(tagName).to.equal("svg");
			}
			else {
				// Check for IE 8
				expect(tagName).to.equal("div");
			}
		});

		it("should have the same dimensions as its enclosing div", function() {
			// create div that's assumed to be in our home page
			var testHtml = "<div style='height: 200px; width: 400px'>hi</div>";
			$(document.body).append(testHtml);

			// initialize it (production code)
			var paper = wwp.initializeDrawingArea("wwp-drawingArea");
			expect(paper.width).to.equal(400);
			expect(paper.height).to.equal(200);


			// verify that it has the appropriate size
//
//			// verify it was initialized correctly
//			var tagName = $(div).children()[0].tagName.toLowerCase();
//			if (tagName === "svg") {
//				// We're in a browser that supports SVG
//				expect(tagName).to.equal("svg");
//			}
//			else {
//				// Check for IE 8
//				expect(tagName).to.equal("div");
//			}
		});

	});
}());
