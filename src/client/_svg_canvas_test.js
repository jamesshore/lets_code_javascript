// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*global HtmlElement, $ */

(function() {
	"use strict";

	var SvgCanvas = require("./svg_canvas.js");
	var HtmlElement = require("./html_element.js");

	describe("SvgCanvas", function() {

		var div;
		var svgCanvas;

		beforeEach(function() {
			div = HtmlElement.fromHtml("<div style='height: 900px; width: 200px'>hi</div>");
			div.appendSelfToBody();
			svgCanvas = new SvgCanvas(div);
		});

		afterEach(function() {
			div.remove();
		});

		it("should have the same dimensions as its enclosing div", function() {
			expect(svgCanvas.height()).to.equal(900);
			expect(svgCanvas.width()).to.equal(200);
		});

		it("returns zero line segments", function() {
			expect(svgCanvas.lineSegments()).to.eql([]);
		});

		it("draws and returns one line segment", function() {
			svgCanvas.drawLine(1, 2, 5, 10);
			expect(svgCanvas.lineSegments()).to.eql([[1, 2, 5, 10]]);
		});

		it("draws and returns multiple line segments", function() {
			svgCanvas.drawLine(1, 2, 5, 10);
			svgCanvas.drawLine(20, 60, 2, 3);
			svgCanvas.drawLine(0, 0, 100, 200);
			expect(svgCanvas.lineSegments()).to.eql([
				[1, 2, 5, 10],
				[20, 60, 2, 3],
				[0, 0, 100, 200]
			]);
		});

		it.only("draws a dot when line segment consists of a single pixel", function() {

			svgCanvas.drawLine(3, 3, 4, 4);
			svgCanvas.lineSegments();

			// TO DO: a comment about why line-cap and stroke-width matter here

			// assertions about line-cap and stroke-width

		});

	});

}());