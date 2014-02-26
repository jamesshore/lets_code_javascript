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
			div = HtmlElement.fromHtml("<div style='width: 200px; height: 900px;'>hi</div>");
			div.appendSelfToBody();
			svgCanvas = new SvgCanvas(div);
		});

		afterEach(function() {
			div.remove();
		});

		it.only("has the same dimensions as its enclosing div, regardless of border", function() {
			// TO DO
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

		it("draws dots and styles them nicely", function() {
			svgCanvas.drawDot(5, 10);

			var elements = svgCanvas.elementsForTestingOnly();
			expect(elements.length).to.equal(1);

			expect(elements[0].type).to.equal("circle");

			var attrs = elements[0].attrs;
			expect(attrs.cx).to.equal(5);
			expect(attrs.cy).to.equal(10);
			expect(attrs.r).to.equal(SvgCanvas.STROKE_WIDTH / 2);
			expect(attrs.stroke).to.equal(SvgCanvas.LINE_COLOR);
			expect(attrs.fill).to.equal(SvgCanvas.LINE_COLOR);
		});

		it("styles lines nicely", function() {
			svgCanvas.drawLine(3, 3, 4, 4);
			var attrs = svgCanvas.elementsForTestingOnly()[0].attrs;
			expect(attrs.stroke).to.equal(SvgCanvas.LINE_COLOR);
			expect(attrs["stroke-width"]).to.equal(SvgCanvas.STROKE_WIDTH);
			expect(attrs["stroke-linecap"]).to.equal(SvgCanvas.LINE_CAP);
		});

	});

}());