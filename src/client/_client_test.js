// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global describe, it, expect, dump, $, wwp, afterEach*/

(function() {
	"use strict";

	describe("Drawing area", function() {

		var drawingArea;

		afterEach(function() {
			drawingArea.remove();
		});

		it("should be initialized with Raphael", function() {
			drawingArea = $("<div></div>");
			$(document.body).append(drawingArea);

			// initialize it (production code)
			wwp.initializeDrawingArea(drawingArea[0]);

			// verify it was initialized correctly
			var tagName = $(drawingArea).children()[0].tagName.toLowerCase();
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
			drawingArea = $("<div style='height: 300px; width: 600px'>hi</div>");
			$(document.body).append(drawingArea);

			var paper = wwp.initializeDrawingArea(drawingArea[0]);

			expect(paper.height).to.equal(300);
			expect(paper.width).to.equal(600);
		});

	});
}());
