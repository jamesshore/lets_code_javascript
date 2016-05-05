// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*global HtmlElement, $, Raphael:true */

(function() {
	"use strict";

	var SvgCanvas = require("./svg_canvas.js");
	var HtmlElement = require("./html_element.js");
	var HtmlCoordinate = require("./html_coordinate.js");
	var assert = require("../../shared/_assert.js");

	describe("UI: SvgCanvas", function() {

		var div;
		var svgCanvas;
		var irrelevantElement = HtmlElement.fromHtml("<div'></div>");

		beforeEach(function() {
			div = HtmlElement.fromHtml("<div style='width: 200px; height: 900px;'>hi</div>");
			div.appendSelfToBody();
			svgCanvas = new SvgCanvas(div);
		});

		afterEach(function() {
			div.remove();
		});

		it("has the same dimensions as its enclosing div, regardless of border", function() {
			// There might be a better way of coding this that doesn't use a spy.
			// See Martin Grandrath's suggestion at http://www.letscodejavascript.com/v3/comments/live/185#comment-1292169079

			var realRaphael = Raphael;
			try {
				Raphael = SpyRaphael;
				svgCanvas = new SvgCanvas(div);
				assert.equal(Raphael.width, 200);
				assert.equal(Raphael.height, 900);
			}
			finally {
				Raphael = realRaphael;
			}

			function SpyRaphael(element, width, height) {
				SpyRaphael.width = width;
				SpyRaphael.height = height;
			}
		});

		it("returns zero line segments", function() {
			assert.deepEqual(svgCanvas.lineSegments(), []);
		});

		it("draws and returns one line segment", function() {
			svgCanvas.drawLine(coord(1, 2), coord(5, 10));
			assert.deepEqual(svgCanvas.lineSegments(), [[1, 2, 5, 10]]);
		});

		it("draws and returns multiple line segments", function() {
			svgCanvas.drawLine(coord(1, 2), coord(5, 10));
			svgCanvas.drawLine(coord(20, 60), coord(2, 3));
			svgCanvas.drawLine(coord(0, 0), coord(100, 200));
			assert.deepEqual(svgCanvas.lineSegments(), [
				[1, 2, 5, 10],
				[20, 60, 2, 3],
				[0, 0, 100, 200]
			]);
		});

		it("draws dots and styles them nicely", function() {
			svgCanvas.drawDot(coord(5, 10));

			var elements = svgCanvas.elementsForTestingOnly();
			assert.equal(elements.length, 1);

			assert.equal(elements[0].type, "circle");

			var attrs = elements[0].attrs;
			assert.equal(attrs.cx, 5);
			assert.equal(attrs.cy, 10);
			assert.equal(attrs.r, SvgCanvas.STROKE_WIDTH / 2);
			assert.equal(attrs.stroke, SvgCanvas.LINE_COLOR);
			assert.equal(attrs.fill, SvgCanvas.LINE_COLOR);
		});

		it("styles lines nicely", function() {
			svgCanvas.drawLine(coord(3, 3), coord(4, 4));
			var attrs = svgCanvas.elementsForTestingOnly()[0].attrs;
			assert.equal(attrs.stroke, SvgCanvas.LINE_COLOR);
			assert.equal(attrs["stroke-width"], SvgCanvas.STROKE_WIDTH);
			assert.equal(attrs["stroke-linecap"], SvgCanvas.LINE_CAP);
		});

		it("clears everything", function() {
			svgCanvas.drawLine(coord(3, 3), coord(4, 4));
			svgCanvas.clear();
			assert.deepEqual(svgCanvas.lineSegments(), []);
		});

		function coord(x, y) {
			return HtmlCoordinate.fromRelativeOffset(irrelevantElement, x, y);
		}

	});

}());