// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global Raphael, mocha, Touch */

(function() {
	"use strict";

	var client = require("./client.js");
	var browser = require("./browser.js");
	var HtmlElement = require("./html_element.js");

	mocha.setup({ignoreLeaks: true});

	describe("Drawing area", function() {
		var drawingArea;
		var documentBody;
		var windowElement;
		var svgCanvas;

		beforeEach(function() {
			documentBody = new HtmlElement(document.body);
			windowElement = new HtmlElement(window);
			drawingArea = HtmlElement.fromHtml("<div style='height: 300px; width: 600px'>hi</div>");
			drawingArea.appendSelfToBody();
			svgCanvas = client.initializeDrawingArea(drawingArea);
		});

		afterEach(function() {
			drawingArea.remove();
			client.drawingAreaHasBeenRemovedFromDom();
			documentBody.removeAllEventHandlers();
		});

		describe("mouse events", function() {
			it("draws a line in response to mouse drag", function() {
				drawingArea.triggerMouseDown(20, 30);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseUp(50, 60);

				expect(lineSegments()).to.eql([
					[20, 30, 50, 60]
				]);
			});

			it("draws multiple line segments when mouse is dragged multiple places", function() {
				drawingArea.triggerMouseDown(20, 30);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseMove(40, 20);
				drawingArea.triggerMouseMove(10, 15);
				drawingArea.triggerMouseUp(10, 15);

				expect(lineSegments()).to.eql([
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

				expect(lineSegments()).to.eql([
					[20, 30, 50, 60],
					[30, 25, 10, 15]
				]);
			});

			it("does not draw line segment when mouse button is released", function() {
				drawingArea.triggerMouseDown(20, 30);
				drawingArea.triggerMouseUp(50, 60);

				expect(lineSegments()).to.eql([]);
			});

			it("does not draw line segments when mouse button has never been pushed", function() {
				drawingArea.triggerMouseMove(20, 30);
				drawingArea.triggerMouseMove(50, 60);

				expect(lineSegments()).to.eql([]);
			});

			it("stops drawing line segments after mouse button is released", function() {
				drawingArea.triggerMouseDown(20, 30);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseUp(50, 60);

				drawingArea.triggerMouseMove(10, 15);

				expect(lineSegments()).to.eql([
					[20, 30, 50, 60]
				]);
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

				expect(lineSegments()).to.eql([
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

				expect(lineSegments()).to.eql([
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

				expect(lineSegments()).to.eql([
					[20, 30, 50, 60],
					[50, 60, 700, 70]
				]);
			});

			it("does not start drawing if drag is started outside drawing area", function() {
				documentBody.triggerMouseDown(601, 150);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseUp(50, 60);

				documentBody.triggerMouseDown(-1, 150);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseUp(50, 60);

				documentBody.triggerMouseDown(120, 301);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseUp(50, 60);

				documentBody.triggerMouseDown(-1, 301);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseUp(50, 60);

				expect(lineSegments()).to.eql([]);
			});

			it("does start drawing if drag is initiated exactly at edge of drawing area", function() {
				drawingArea.triggerMouseDown(600, 300);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseUp(50, 60);

				drawingArea.triggerMouseDown(0, 0);
				drawingArea.triggerMouseMove(50, 60);
				drawingArea.triggerMouseUp(50, 60);

				expect(lineSegments()).to.eql([
					[600, 300, 50, 60],
					[0, 0, 50, 60]
				]);
			});

			it("does not allow text to be selected outside drawing area when drag starts within drawing area", function() {
				drawingArea.onMouseDown(function(offset, event) {
					expect(event.isDefaultPrevented()).to.be(true);
				});

				drawingArea.triggerMouseDown(20, 30);
				drawingArea.triggerMouseMove(90, 40);
				drawingArea.triggerMouseUp(90, 40);
			});

			it("does not allow text to be selected outside drawing area even -- INCLUDING IE 8", function() {
				drawingArea.onSelectStart_ie8Only(function(offset, event) {
					expect(event.isDefaultPrevented()).to.be(true);
				});

				drawingArea.triggerSelectStart(20, 30);
			});
		});

		if (browser.supportsTouchEvents()) {
			describe("touch events", function() {

				it("draw lines in response to touch events", function() {
					drawingArea.triggerSingleTouchStart(10, 40);
					drawingArea.triggerSingleTouchMove(5, 20);
					drawingArea.triggerSingleTouchEnd(5, 20);

					expect(lineSegments()).to.eql([
						[10, 40, 5, 20]
					]);
				});

				it("stops drawing lines when touch ends", function() {
					drawingArea.triggerSingleTouchStart(10, 40);
					drawingArea.triggerSingleTouchMove(5, 20);
					drawingArea.triggerSingleTouchEnd(5, 20);

					drawingArea.triggerSingleTouchMove(50, 60);

					expect(lineSegments()).to.eql([
						[10, 40, 5, 20]
					]);
				});

				it("stop drawing lines when touch is cancelled", function() {
					drawingArea.triggerSingleTouchStart(10, 40);
					drawingArea.triggerSingleTouchMove(5, 20);
					drawingArea.triggerSingleTouchCancel(5, 20);

					drawingArea.triggerSingleTouchMove(50, 60);

					expect(lineSegments()).to.eql([
						[10, 40, 5, 20]
					]);
				});

				it("does not scroll or zoom the page when user is drawing with finger", function() {
					drawingArea.onSingleTouchStart(function(offset, event) {
						expect(event.isDefaultPrevented()).to.be(true);
					});

					drawingArea.triggerSingleTouchStart(10, 40);
					drawingArea.triggerSingleTouchMove(5, 20);
					drawingArea.triggerSingleTouchEnd(5, 20);
				});

				it("stops drawing when multiple touches occur", function() {
					drawingArea.triggerSingleTouchStart(10, 40);
					drawingArea.triggerSingleTouchMove(5, 20);

					drawingArea.triggerMultiTouchStart(5, 20, 6, 60);
					drawingArea.triggerSingleTouchMove(1, 10, 7, 70);
					drawingArea.triggerSingleTouchEnd(1, 10, 7, 70);

					expect(lineSegments()).to.eql([
						[10, 40, 5, 20]
					]);
				});
			});
		}

		function lineSegments() {
			return svgCanvas.lineSegments();
		}

	});
}());
