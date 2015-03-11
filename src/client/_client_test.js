// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global Raphael, mocha, Touch */

(function() {
	"use strict";

	var client = require("./client.js");
	var browser = require("./browser.js");
	var HtmlElement = require("./html_element.js");
	var assert = require("../shared/_assert.js");

	mocha.setup({ignoreLeaks: true});

	describe("Drawing area", function() {
		var drawingArea;
		var clearButton;
		var documentBody;
		var windowElement;
		var svgCanvas;

		beforeEach(function() {
			documentBody = new HtmlElement(document.body);
			windowElement = new HtmlElement(window);

			drawingArea = HtmlElement.fromHtml("<div style='height: 300px; width: 600px'>hi</div>");
			drawingArea.appendSelfToBody();

			clearButton = HtmlElement.fromHtml("<input type='button'>");

			svgCanvas = client.initializeDrawingArea({
				drawingAreaDiv: drawingArea,
				clearScreenButton: clearButton
			});
		});

		afterEach(function() {
			drawingArea.remove();
			documentBody.removeAllEventHandlers();
			windowElement.removeAllEventHandlers();
			client.drawingAreaHasBeenRemovedFromDom();
		});

		it("does not allow text to be selected or page to scroll when drag starts within drawing area", function() {
			assert.equal(drawingArea.isBrowserDragDefaultsPrevented(), true);
		});

		it("clears drawing area when 'clear screen' button is clicked", function() {
			dragMouse(10, 20, 40, 90);
			clearButton.triggerMouseClick();
			assert.deepEqual(lines(), []);
		});

		describe("mouse drag events", function() {
			it("draws a dot in response to mouse click", function() {
				drawingArea.triggerMouseDown(50, 60);
				drawingArea.triggerMouseUp(50, 60);
				drawingArea.triggerMouseClick(50, 60);

				assert.deepEqual(lines(), [
					[50, 60]
				]);
			});

			it("draws a line in response to mouse drag", function() {
				drawingArea.triggerMouseDown(20, 30);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseUp(50, 60);

				assert.deepEqual(lines(), [
					[20, 30, 50, 60]
				]);
			});

			it("does not draw a dot at the end of a drag", function() {
				drawingArea.triggerMouseDown(20, 30);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseUp(50, 60);
				drawingArea.triggerMouseClick(50, 60);

				assert.deepEqual(lines(), [
					[20, 30, 50, 60]
				]);
			});

			it("does not draw a dot if drag not started in drawing area", function() {
				drawingArea.triggerMouseUp(20, 40);

				assert.deepEqual(lines(), []);
			});

			it("draws multiple line segments when mouse is dragged multiple places", function() {
				drawingArea.triggerMouseDown(20, 30);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseMove(40, 20);
				drawingArea.triggerMouseMove(10, 15);
				drawingArea.triggerMouseUp(10, 15);

				assert.deepEqual(lines(), [
					[20, 30, 50, 60],
					[50, 60, 40, 20],
					[40, 20, 10, 15]
				]);
			});

			it("does not draw a dot when mouse is dragged slowly in the middle of a line", function() {
				drawingArea.triggerMouseDown(20, 30);
				drawingArea.triggerMouseMove(50, 60);

				drawingArea.triggerMouseMove(40, 20);
				drawingArea.triggerMouseMove(40, 20);
				drawingArea.triggerMouseMove(40, 20);

				drawingArea.triggerMouseMove(10, 15);
				drawingArea.triggerMouseUp(10, 15);

				assert.deepEqual(lines(), [
					[20, 30, 50, 60],
					[50, 60, 40, 20],
					[40, 20, 10, 15]
				]);

			});

			it("draws multiple line segments when there are multiple drags", function() {
				drawingArea.triggerMouseDown(20, 30);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseUp(50, 60);

				drawingArea.triggerMouseMove(40, 20);

				drawingArea.triggerMouseDown(30, 25);
				drawingArea.triggerMouseMove(10, 15);
				drawingArea.triggerMouseUp(10, 15);

				assert.deepEqual(lines(), [
					[20, 30, 50, 60],
					[30, 25, 10, 15]
				]);
			});

			it("stops drawing line segments after mouse button is released", function() {
				drawingArea.triggerMouseDown(20, 30);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseUp(50, 60);

				drawingArea.triggerMouseMove(10, 15);

				assert.deepEqual(lines(), [
					[20, 30, 50, 60]
				]);
			});

			it("does not draw line segments when mouse button has never been pushed", function() {
				drawingArea.triggerMouseMove(20, 30);
				drawingArea.triggerMouseMove(50, 60);

				assert.deepEqual(lines(), []);
			});

			it("continues drawing if mouse leaves drawing area and comes back in", function() {
				drawingArea.triggerMouseDown(20, 30);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseLeave(700, 70);

				var pageCoordinates = drawingArea.pageOffset({x: 700, y: 70});
				var bodyRelative = documentBody.relativeOffset(pageCoordinates);
				documentBody.triggerMouseMove(bodyRelative.x, bodyRelative.y);

				drawingArea.triggerMouseMove(90, 40);
				drawingArea.triggerMouseUp(90, 40);

				assert.deepEqual(lines(), [
					[20, 30, 50, 60],
					[50, 60, 700, 70],
					[700, 70, 90, 40]
				]);
			});

			it("stops drawing if mouse leaves drawing area and mouse button is released", function() {
				drawingArea.triggerMouseDown(20, 30);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseLeave(700, 70);

				var pageCoordinates = drawingArea.pageOffset({x: 700, y: 70});
				var bodyRelative = documentBody.relativeOffset(pageCoordinates);
				documentBody.triggerMouseMove(bodyRelative.x, bodyRelative.y);
				documentBody.triggerMouseUp(bodyRelative.x, bodyRelative.y);

				drawingArea.triggerMouseMove(90, 40);

				assert.deepEqual(lines(), [
					[20, 30, 50, 60],
					[50, 60, 700, 70]
				]);
			});

			it("stops drawing if mouse leaves window and mouse button is released", function() {
				drawingArea.triggerMouseDown(20, 30);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseLeave(700, 70);

				var pageCoordinates = drawingArea.pageOffset({x: 700, y: 70});
				var bodyRelative = documentBody.relativeOffset(pageCoordinates);
				documentBody.triggerMouseMove(bodyRelative.x, bodyRelative.y);

				windowElement.triggerMouseLeave();
				windowElement.triggerMouseUp();

				drawingArea.triggerMouseMove(90, 40);

				assert.deepEqual(lines(), [
					[20, 30, 50, 60],
					[50, 60, 700, 70]
				]);
			});

			it("does not start drawing if drag is started outside drawing area", function() {
				documentBody.triggerMouseDown(700, 70);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseUp(50, 60);

				assert.deepEqual(lines(), []);
			});

		});

		if (browser.supportsTouchEvents()) {
			describe("touch drag events", function() {

				it("draw a dot when screen is tapped", function() {
					drawingArea.triggerSingleTouchStart(3, 42);
					drawingArea.triggerTouchEnd();

					assert.deepEqual(lines(), [
						[3, 42]
					]);
				});

				it("draw lines in response to touch events", function() {
					drawingArea.triggerSingleTouchStart(10, 40);
					drawingArea.triggerSingleTouchMove(5, 20);
					drawingArea.triggerTouchEnd(5, 20);

					assert.deepEqual(lines(), [
						[10, 40, 5, 20]
					]);
				});

				it("draws multiple lines in response to multiple touch drags", function() {
					drawingArea.triggerSingleTouchStart(10, 40);
					drawingArea.triggerSingleTouchMove(5, 20);
					drawingArea.triggerTouchEnd(5, 20);

					drawingArea.triggerSingleTouchStart(30, 40);
					drawingArea.triggerSingleTouchMove(50, 60);
					drawingArea.triggerTouchEnd(50, 60);

					assert.deepEqual(lines(), [
						[10, 40, 5, 20],
						[30, 40, 50, 60]
					]);
				});

				it("stop drawing lines when touch is cancelled", function() {
					drawingArea.triggerSingleTouchStart(10, 40);
					drawingArea.triggerSingleTouchMove(5, 20);
					drawingArea.triggerTouchCancel(5, 20);

					assert.deepEqual(lines(), [
						[10, 40, 5, 20]
					]);
				});

				it("stops drawing when multiple touches occur", function() {
					drawingArea.triggerSingleTouchStart(10, 40);
					drawingArea.triggerSingleTouchMove(5, 20);

					drawingArea.triggerMultiTouchStart(5, 20, 6, 60);
					drawingArea.triggerSingleTouchMove(1, 10, 7, 70);
					drawingArea.triggerTouchEnd(1, 10, 7, 70);

					assert.deepEqual(lines(), [
						[10, 40, 5, 20]
					]);
				});
			});
		}

		function dragMouse(startX, startY, endX, endY) {
			drawingArea.triggerMouseDown(startX, startY);
			drawingArea.triggerMouseMove(endX, endY);
			drawingArea.triggerMouseUp(endX, endY);
		}

		function lines() {
			return svgCanvas.lineSegments();
		}

	});
}());
