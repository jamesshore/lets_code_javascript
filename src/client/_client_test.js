// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global jQuery, describe, it, expect, dump, $, wwp, beforeEach, afterEach, Raphael*/

(function() {
	"use strict";

	describe("Drawing area", function() {

		var drawingArea;
		var paper;

		afterEach(function() {
			drawingArea.remove();
		});

		it("should have the same dimensions as its enclosing div", function() {
			drawingArea = $("<div style='height: 300px; width: 600px'>hi</div>");
			$(document.body).append(drawingArea);
			paper = wwp.initializeDrawingArea(drawingArea[0]);

			expect(paper.height).to.equal(300);
			expect(paper.width).to.equal(600);
		});

		it("draws a line in response to mouse drag", function() {
			drawingArea = $("<div style='height: 300px; width: 600px'>hi</div>");
			$(document.body).append(drawingArea);
			paper = wwp.initializeDrawingArea(drawingArea[0]);

			mouseDown(20, 30);
			mouseMove(50, 60);

			expect(paperPaths(paper)).to.eql([ [20, 30, 50, 60] ]);
		});

		it("draws multiple line segments when mouse dragged multiple places", function() {
			drawingArea = $("<div style='height: 300px; width: 600px'>hi</div>");
			$(document.body).append(drawingArea);
			paper = wwp.initializeDrawingArea(drawingArea[0]);

			mouseDown(20, 30);
			mouseMove(50, 60);
			mouseMove(40, 20);
			mouseMove(10, 15);

			expect(paperPaths(paper)).to.eql([ [20, 30, 50, 60], [50, 60, 40, 20], [40, 20, 10, 15] ]);
		});

		it("draws multiple line segments when there are multiple drags", function() {
			drawingArea = $("<div style='height: 300px; width: 600px'>hi</div>");
			$(document.body).append(drawingArea);
			paper = wwp.initializeDrawingArea(drawingArea[0]);

			mouseDown(20, 30);
			mouseMove(50, 60);
			mouseUp(50, 60);

			mouseMove(40, 20);

			mouseDown(30, 25);
			mouseMove(10, 15);
			mouseUp(10, 15);

			expect(paperPaths(paper)).to.eql([ [20, 30, 50, 60], [30, 25, 10, 15] ]);
		});

		it("does not draw line segment in response to mouseup event", function() {
			drawingArea = $("<div style='height: 300px; width: 600px'>hi</div>");
			$(document.body).append(drawingArea);
			paper = wwp.initializeDrawingArea(drawingArea[0]);

			mouseDown(20, 30);
			mouseUp(50, 60);

			expect(paperPaths(paper)).to.eql([]);
		});

		it("does not draw line segments when mouse is not down", function() {
			drawingArea = $("<div style='height: 300px; width: 600px'>hi</div>");
			$(document.body).append(drawingArea);
			paper = wwp.initializeDrawingArea(drawingArea[0]);

			mouseMove(20, 30);
			mouseMove(50, 60);

			expect(paperPaths(paper)).to.eql([]);
		});

		it("stops drawing line segments when mouse is up", function() {
			drawingArea = $("<div style='height: 300px; width: 600px'>hi</div>");
			$(document.body).append(drawingArea);
			paper = wwp.initializeDrawingArea(drawingArea[0]);

			mouseDown(20, 30);
			mouseMove(50, 60);
			mouseUp(50, 60);
			mouseMove(10, 15);

			expect(paperPaths(paper)).to.eql([ [20, 30, 50, 60] ]);
		});

		it("does not start drawing if drag is started outside drawing area", function() {
			drawingArea = $("<div style='height: 300px; width: 600px'>hi</div>");
			$(document.body).append(drawingArea);
			paper = wwp.initializeDrawingArea(drawingArea[0]);

			mouseDown(601, 150);
			mouseMove(50, 60);

			mouseDown(-1, 150);
			mouseMove(50, 60);

			mouseDown(120, 301);
			mouseMove(50, 60);

			mouseDown(-1, 301);
			mouseMove(50, 60);

			expect(paperPaths(paper)).to.eql([]);
		});

		it("does start drawing if drag is initiated exactly at edge of drawing area", function() {
			drawingArea = $("<div style='height: 300px; width: 600px'>hi</div>");
			$(document.body).append(drawingArea);
			paper = wwp.initializeDrawingArea(drawingArea[0]);

			mouseDown(600, 300);
			mouseMove(50, 60);
			mouseUp(50, 60);

			mouseDown(0, 0);
			mouseMove(50, 60);
			mouseUp(50, 60);

			expect(paperPaths(paper)).to.eql([ [600, 300, 50, 60], [0, 0, 50, 60] ]);
		});

//		it("considers border when calculating mouse target", function() {
//			drawingArea = $("<div style='height: 300px; width: 600px; border-width: 13px'>hi</div>");
//			$(document.body).append(drawingArea);
//			paper = wwp.initializeDrawingArea(drawingArea[0]);
//
//			var eventData = new jQuery.Event();
//			eventData.pageX = 20;
//			eventData.pageY = 30;
//			eventData.type = "click";
//
//			drawingArea.trigger(eventData);
//
//			var topLeftOfDrawingArea = drawingArea.offset();
//			var borderWidth = 13;
//			var expectedX = 20 - topLeftOfDrawingArea.left - borderWidth;
//			var expectedY = 30 - topLeftOfDrawingArea.top - borderWidth;
//
//			var elements = drawingElements(paper);
//			expect(elements.length).to.equal(1);
//			expect(pathFor(elements[0])).to.equal("M0,0L" + expectedX + "," + expectedY);
//		});

		// TODO: test that em is converted px

		function mouseDown(relativeX, relativeY) {
			sendMouseEvent("mousedown", relativeX, relativeY);
		}

		function mouseMove(relativeX, relativeY) {
			sendMouseEvent("mousemove", relativeX, relativeY);
		}

		function mouseUp(relativeX, relativeY) {
			sendMouseEvent("mouseup", relativeX, relativeY);
		}

		function sendMouseEvent(event, relativeX, relativeY) {
			var page = pageOffset(drawingArea, relativeX, relativeY);

			var eventData = new jQuery.Event();
			eventData.pageX = page.x;
			eventData.pageY = page.y;
			eventData.type = event;
			drawingArea.trigger(eventData);
		}

		function pageOffset(drawingArea, relativeX, relativeY) {
			var topLeftOfDrawingArea = drawingArea.offset();
			return {
				x: relativeX + topLeftOfDrawingArea.left,
				y: relativeY + topLeftOfDrawingArea.top
			};
		}

		function paperPaths(paper) {
			var result = [];
			paper.forEach(function(element) {
				result.push(pathFor(element));
			});
			return result;
		}

		function pathFor(element) {
			if (Raphael.vml) return vmlPathFor(element);
			else if (Raphael.svg) return svgPathFor(element);
			else throw new Error("Unknown Raphael type");
		}

		function svgPathFor(element) {
			var pathRegex;

			var path = element.node.attributes.d.value;
			if (path.indexOf(",") !== -1)
				// We're in Firefox, Safari, Chrome, which uses format "M20,30L30,300"
				pathRegex = /M(\d+),(\d+)L(\d+),(\d+)/;
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
