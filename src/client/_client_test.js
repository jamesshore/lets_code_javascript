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

		it("should draw a line", function() {
			drawingArea = $("<div style='height: 300px; width: 600px'>hi</div>");
			$(document.body).append(drawingArea);
			paper = wwp.initializeDrawingArea(drawingArea[0]);

			wwp.drawLine(20, 30, 30, 300);
			expect(paperPaths(paper)).to.eql([ [20, 30, 30, 300] ]);
		});

		it("it does not draw line segments when mouse is not down", function() {
			drawingArea = $("<div style='height: 300px; width: 600px'>hi</div>");
			$(document.body).append(drawingArea);
			paper = wwp.initializeDrawingArea(drawingArea[0]);

			mouseMove(20, 30);
			mouseMove(50, 60);

			expect(paperPaths(paper)).to.eql([]);
		});

		it("it stops drawing line segments when mouse is up", function() {
			drawingArea = $("<div style='height: 300px; width: 600px'>hi</div>");
			$(document.body).append(drawingArea);
			paper = wwp.initializeDrawingArea(drawingArea[0]);

			mouseDown(20, 30);
			mouseMove(20, 30);    // TODO: don't need first move event -- down event should be enough
			mouseMove(50, 60);
			mouseUp(50, 60);
			mouseMove(10, 15);

			expect(paperPaths(paper)).to.eql([ [20, 30, 50, 60] ]);
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

		function clickMouse(relativeX, relativeY) {
			var topLeftOfDrawingArea = drawingArea.offset();
			var pageX = relativeX + topLeftOfDrawingArea.left;
			var pageY = relativeY + topLeftOfDrawingArea.top;

			var eventData = new jQuery.Event();
			eventData.pageX = pageX;
			eventData.pageY = pageY;
			eventData.type = "click";
			drawingArea.trigger(eventData);
		}

		function mouseDown(relativeX, relativeY) {
			var topLeftOfDrawingArea = drawingArea.offset();
			var pageX = relativeX + topLeftOfDrawingArea.left;
			var pageY = relativeY + topLeftOfDrawingArea.top;

			var eventData = new jQuery.Event();
			eventData.pageX = pageX;
			eventData.pageY = pageY;
			eventData.type = "mousedown";
			drawingArea.trigger(eventData);
		}

		function mouseMove(relativeX, relativeY) {
			var topLeftOfDrawingArea = drawingArea.offset();
			var pageX = relativeX + topLeftOfDrawingArea.left;
			var pageY = relativeY + topLeftOfDrawingArea.top;

			var eventData = new jQuery.Event();
			eventData.pageX = pageX;
			eventData.pageY = pageY;
			eventData.type = "mousemove";
			drawingArea.trigger(eventData);
		}

		function mouseUp(relativeX, relativeY) {
			var topLeftOfDrawingArea = drawingArea.offset();
			var pageX = relativeX + topLeftOfDrawingArea.left;
			var pageY = relativeY + topLeftOfDrawingArea.top;

			var eventData = new jQuery.Event();
			eventData.pageX = pageX;
			eventData.pageY = pageY;
			eventData.type = "mouseup";
			drawingArea.trigger(eventData);
		}

		function paperPaths(paper) {
			// Note: Paths are normalized with left side first in all cases
			var box;
			var result = [];
			for (var i = 0; i < drawingElements(paper).length; i++) {
				box = pathFor(drawingElements(paper)[i]);
				result.push([ box.x, box.y, box.x2, box.y2 ]);
			}
			return result;
		}

		function drawingElements(paper) {
			var result = [];
			paper.forEach(function(element) {
				result.push(element);
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
			return {
				x: pathComponents[1],
				y: pathComponents[2],
				x2: pathComponents[3],
				y2: pathComponents[4]
			};
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

			return {
				x: startX,
				y: startY,
				x2: endX,
				y2: endY
			};
		}

	});
}());
