// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*global HtmlElement, $ */

(function() {
	"use strict";

	describe("SvgCanvas", function() {

		var div;
		var svgCanvas;

		beforeEach(function() {
			div = wwp.HtmlElement.fromHtml("<div style='height: 300px; width: 600px'>hi</div>");
			var documentBody = new wwp.HtmlElement($(document.body));
			documentBody.append(div);
			svgCanvas = new wwp.SvgCanvas(div);
		});

		afterEach(function() {
			div.remove();
			wwp.drawingAreaHasBeenRemovedFromDom();
		});

		it("returns height and width", function() {
			expect(svgCanvas.height()).to.equal(300);
			expect(svgCanvas.width()).to.equal(600);
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

	});

}());