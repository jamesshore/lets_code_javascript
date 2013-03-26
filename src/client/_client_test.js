// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global jQuery, describe, it, expect, dump, $, wwp, beforeEach, afterEach, Raphael, TouchEvent, mocha, TouchList, Touch */

(function() {
	"use strict";

	mocha.setup({ignoreLeaks: true});

	describe("Drawing area", function() {
		var oldDrawingArea;
		var drawingArea;
		var documentBody;
		var paper;

		beforeEach(function() {
			drawingArea = wwp.DomElement.fromHtml("<div style='height: 300px; width: 600px'>hi</div>");
			oldDrawingArea = drawingArea.element;

			documentBody = new wwp.DomElement($(document.body));
			$(document.body).append(oldDrawingArea);
			paper = wwp.initializeDrawingArea(drawingArea);
		});

		afterEach(function() {
			oldDrawingArea.remove();
			wwp.drawingAreaHasBeenRemovedFromDom(oldDrawingArea[0]);
		});

		it("should have the same dimensions as its enclosing div", function() {
			expect(paper.height).to.equal(300);
			expect(paper.width).to.equal(600);
		});

		describe("mouse events", function() {
			it("draws a line in response to mouse drag", function() {
				drawingArea.doMouseDown(20, 30);
				drawingArea.doMouseMove(50, 60);
				drawingArea.doMouseUp(50, 60);
				expect(lineSegments()).to.eql([
					[20, 30, 50, 60]
				]);
			});

			it("draws multiple line segments when mouse is dragged multiple places", function() {
				drawingArea.doMouseDown(20, 30);
				drawingArea.doMouseMove(50, 60);
				drawingArea.doMouseMove(40, 20);
				drawingArea.doMouseMove(10, 15);
				drawingArea.doMouseUp(10, 15);
				expect(lineSegments()).to.eql([
					[20, 30, 50, 60],
					[50, 60, 40, 20],
					[40, 20, 10, 15]
				]);
			});

			it("draws multiple line segments when there are multiple drags", function() {
				drawingArea.doMouseDown(20, 30);
				drawingArea.doMouseMove(50, 60);
				drawingArea.doMouseUp(50, 60);
				drawingArea.doMouseMove(40, 20);
				drawingArea.doMouseDown(30, 25);
				drawingArea.doMouseMove(10, 15);
				drawingArea.doMouseUp(10, 15);
				expect(lineSegments()).to.eql([
					[20, 30, 50, 60],
					[30, 25, 10, 15]
				]);
			});

			it("does not draw line segment when mouse button is released", function() {
				drawingArea.doMouseDown(20, 30);
				drawingArea.doMouseUp(50, 60);
				expect(lineSegments()).to.eql([]);
			});

			it("does not draw line segments when mouse button has never been pushed", function() {
				drawingArea.doMouseMove(20, 30);
				drawingArea.doMouseMove(50, 60);
				expect(lineSegments()).to.eql([]);
			});

			it("stops drawing line segments after mouse button is released", function() {
				drawingArea.doMouseDown(20, 30);
				drawingArea.doMouseMove(50, 60);
				drawingArea.doMouseUp(50, 60);
				drawingArea.doMouseMove(10, 15);
				expect(lineSegments()).to.eql([
					[20, 30, 50, 60]
				]);
			});

			it("stops drawing when mouse leaves drawing area", function() {
				drawingArea.doMouseDown(20, 30);
				drawingArea.doMouseMove(50, 60);
				drawingArea.doMouseLeave(700, 70);
				documentBody.doMouseMove(700, 70);
				drawingArea.doMouseMove(90, 40);
				drawingArea.doMouseUp(90, 40);
				expect(lineSegments()).to.eql([
					[20, 30, 50, 60]
				]);
			});

			it("does not start drawing if drag is started outside drawing area", function() {
				documentBody.doMouseDown(601, 150);
				drawingArea.doMouseMove(50, 60);
				drawingArea.doMouseUp(50, 60);
				documentBody.doMouseDown(-1, 150);
				drawingArea.doMouseMove(50, 60);
				drawingArea.doMouseUp(50, 60);
				documentBody.doMouseDown(120, 301);
				drawingArea.doMouseMove(50, 60);
				drawingArea.doMouseUp(50, 60);
				documentBody.doMouseDown(-1, 301);
				drawingArea.doMouseMove(50, 60);
				drawingArea.doMouseUp(50, 60);
				expect(lineSegments()).to.eql([]);
			});

			it("does start drawing if drag is initiated exactly at edge of drawing area", function() {
				drawingArea.doMouseDown(600, 300);
				drawingArea.doMouseMove(50, 60);
				drawingArea.doMouseUp(50, 60);
				drawingArea.doMouseDown(0, 0);
				drawingArea.doMouseMove(50, 60);
				drawingArea.doMouseUp(50, 60);
				expect(lineSegments()).to.eql([
					[600, 300, 50, 60],
					[0, 0, 50, 60]
				]);
			});

			it("does not allow text to be selected outside drawing area when drag starts within drawing area", function() {
				drawingArea.onMouseDown(function(offset, event) {
					expect(event.isDefaultPrevented()).to.be(true);
				});
				drawingArea.doMouseDown(20, 30);
				drawingArea.doMouseMove(90, 40);
				drawingArea.doMouseUp(90, 40);
			});

			it("does not allow text to be selected outside drawing area even -- INCLUDING IE 8", function() {
				drawingArea.onSelectStart_ie8Only(function(offset, event) {
					expect(event.isDefaultPrevented()).to.be(true);
				});
				drawingArea.doSelectStart(20, 30);
			});
		});

		if (browserSupportsTouchEvents()) {
			describe("touch events", function() {

				it("draw lines in response to touch events", function() {
					drawingArea.doSingleTouchStart(10, 40);
					drawingArea.doSingleTouchMove(5, 20);
					drawingArea.doSingleTouchEnd(5, 20);
					expect(lineSegments()).to.eql([
						[10, 40, 5, 20]
					]);
				});

				it("stops drawing lines when touch ends", function() {
					drawingArea.doSingleTouchStart(10, 40);
					drawingArea.doSingleTouchMove(5, 20);
					drawingArea.doSingleTouchEnd(5, 20);
					drawingArea.doSingleTouchMove(50, 60);
					expect(lineSegments()).to.eql([
						[10, 40, 5, 20]
					]);
				});

				it("stop drawing lines when touch is cancelled", function() {
					drawingArea.doSingleTouchStart(10, 40);
					drawingArea.doSingleTouchMove(5, 20);
					drawingArea.doSingleTouchCancel(5, 20);
					drawingArea.doSingleTouchMove(50, 60);
					expect(lineSegments()).to.eql([
						[10, 40, 5, 20]
					]);
				});

				it("does not scroll or zoom the page when user is drawing with finger", function() {
					drawingArea.onSingleTouchStart(function(offset, event) {
						expect(event.isDefaultPrevented()).to.be(true);
					});
					drawingArea.doSingleTouchStart(10, 40);
					drawingArea.doSingleTouchMove(5, 20);
					drawingArea.doSingleTouchEnd(5, 20);
				});

				it("stops drawing when multiple touches occur", function() {
					drawingArea.doSingleTouchStart(10, 40);
					drawingArea.doSingleTouchMove(5, 20);
					drawingArea.doMultiTouchStart(5, 20, 6, 60);
					drawingArea.doMultiTouchMove(1, 10, 7, 70);
					drawingArea.doMultiTouchEnd(1, 10, 7, 70);
					expect(lineSegments()).to.eql([
						[10, 40, 5, 20]
					]);
				});
			});
		}

		function browserSupportsTouchEvents() {
			return (typeof Touch !== "undefined");
		}

		function lineSegments() {
			var result = [];
			paper.forEach(function(element) {
				result.push(pathFor(element));
			});
			return result;
		}

		function pathFor(element) {
			if (Raphael.vml) {
				return vmlPathFor(element);
			}
			else if (Raphael.svg) {
				return svgPathFor(element);
			}
			else {
				throw new Error("Unknown Raphael type");
			}
		}

		function svgPathFor(element) {
			var pathRegex;

			var path = element.node.attributes.d.value;
			if (path.indexOf(",") !== -1)
			// We're in Firefox, Safari, Chrome, which uses format "M20,30L30,300"
			{
				pathRegex = /M(\d+),(\d+)L(\d+),(\d+)/;
			}
			else {
				// We're in IE9, which uses format "M 20 30 L 30 300"
				pathRegex = /M (\d+) (\d+) L (\d+) (\d+)/;
			}
			var pathComponents = path.match(pathRegex);
			return [
				pathComponents[1],
				pathComponents[2],
				pathComponents[3],
				pathComponents[4]
			];
		}

		function vmlPathFor(element) {
			// We're in IE 8, which uses format "m432000,648000 l648000,67456800 e"
			var VML_MAGIC_NUMBER = 21600;

			var path = element.node.path.value;

			var ie8PathRegex = /m(\d+),(\d+) l(\d+),(\d+) e/;
			var ie8 = path.match(ie8PathRegex);

			var startX = ie8[1] / VML_MAGIC_NUMBER;
			var startY = ie8[2] / VML_MAGIC_NUMBER;
			var endX = ie8[3] / VML_MAGIC_NUMBER;
			var endY = ie8[4] / VML_MAGIC_NUMBER;

			return [
				startX,
				startY,
				endX,
				endY
			];
		}

	});
}());
