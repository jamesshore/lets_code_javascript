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
			oldDrawingArea = $("<div style='height: 300px; width: 600px'>hi</div>");
			drawingArea = new wwp.DomElement(oldDrawingArea);
			documentBody = new wwp.DomElement($(document.body));
			$(document.body).append(oldDrawingArea);
			paper = wwp.initializeDrawingArea(oldDrawingArea[0]);
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
				drawingArea.mouseDown(20, 30);
				drawingArea.mouseMove(50, 60);
				drawingArea.mouseUp(50, 60);
				expect(lineSegments()).to.eql([
					[20, 30, 50, 60]
				]);
			});

			it("draws multiple line segments when mouse is dragged multiple places", function() {
				drawingArea.mouseDown(20, 30);
				drawingArea.mouseMove(50, 60);
				drawingArea.mouseMove(40, 20);
				drawingArea.mouseMove(10, 15);
				drawingArea.mouseUp(10, 15);
				expect(lineSegments()).to.eql([
					[20, 30, 50, 60],
					[50, 60, 40, 20],
					[40, 20, 10, 15]
				]);
			});

			it("draws multiple line segments when there are multiple drags", function() {
				drawingArea.mouseDown(20, 30);
				drawingArea.mouseMove(50, 60);
				drawingArea.mouseUp(50, 60);
				drawingArea.mouseMove(40, 20);
				drawingArea.mouseDown(30, 25);
				drawingArea.mouseMove(10, 15);
				drawingArea.mouseUp(10, 15);
				expect(lineSegments()).to.eql([
					[20, 30, 50, 60],
					[30, 25, 10, 15]
				]);
			});

			it("does not draw line segment when mouse button is released", function() {
				drawingArea.mouseDown(20, 30);
				drawingArea.mouseUp(50, 60);
				expect(lineSegments()).to.eql([]);
			});

			it("does not draw line segments when mouse button has never been pushed", function() {
				drawingArea.mouseMove(20, 30);
				drawingArea.mouseMove(50, 60);
				expect(lineSegments()).to.eql([]);
			});

			it("stops drawing line segments after mouse button is released", function() {
				drawingArea.mouseDown(20, 30);
				drawingArea.mouseMove(50, 60);
				drawingArea.mouseUp(50, 60);
				drawingArea.mouseMove(10, 15);
				expect(lineSegments()).to.eql([
					[20, 30, 50, 60]
				]);
			});

			it("stops drawing when mouse leaves drawing area", function() {
				drawingArea.mouseDown(20, 30);
				drawingArea.mouseMove(50, 60);
				drawingArea.mouseLeave(700, 70);
				documentBody.mouseMove(700, 70);
				drawingArea.mouseMove(90, 40);
				drawingArea.mouseUp(90, 40);
				expect(lineSegments()).to.eql([
					[20, 30, 50, 60]
				]);
			});

			it("does not start drawing if drag is started outside drawing area", function() {
				documentBody.mouseDown(601, 150);
				drawingArea.mouseMove(50, 60);
				drawingArea.mouseUp(50, 60);
				documentBody.mouseDown(-1, 150);
				drawingArea.mouseMove(50, 60);
				drawingArea.mouseUp(50, 60);
				documentBody.mouseDown(120, 301);
				drawingArea.mouseMove(50, 60);
				drawingArea.mouseUp(50, 60);
				documentBody.mouseDown(-1, 301);
				drawingArea.mouseMove(50, 60);
				drawingArea.mouseUp(50, 60);
				expect(lineSegments()).to.eql([]);
			});

			it("does start drawing if drag is initiated exactly at edge of drawing area", function() {
				drawingArea.mouseDown(600, 300);
				drawingArea.mouseMove(50, 60);
				drawingArea.mouseUp(50, 60);
				drawingArea.mouseDown(0, 0);
				drawingArea.mouseMove(50, 60);
				drawingArea.mouseUp(50, 60);
				expect(lineSegments()).to.eql([
					[600, 300, 50, 60],
					[0, 0, 50, 60]
				]);
			});

			it("does not allow text to be selected outside drawing area when drag starts within drawing area", function() {
				oldDrawingArea.mousedown(function(event) {
					expect(event.isDefaultPrevented()).to.be(true);
				});
				drawingArea.mouseDown(20, 30);
				drawingArea.mouseMove(90, 40);
				drawingArea.mouseUp(90, 40);
			});

			it("does not allow text to be selected outside drawing area even -- INCLUDING IE 8", function() {
				oldDrawingArea.on("selectstart", function(event) {
					expect(event.isDefaultPrevented()).to.be(true);
				});
				drawingArea.selectStart(20, 30);
			});
		});

		if (browserSupportsTouchEvents()) {
			describe("touch events", function() {

				it("draw lines in response to touch events", function() {
					touchStart(10, 40);
					touchMove(5, 20);
					touchEnd(5, 20);

					expect(lineSegments()).to.eql([
						[10, 40, 5, 20]
					]);
				});

				it("stops drawing lines when touch ends", function() {
					touchStart(10, 40);
					touchMove(5, 20);
					touchEnd(5, 20);
					touchMove(50, 60);

					expect(lineSegments()).to.eql([
						[10, 40, 5, 20]
					]);
				});

				it("stop drawing lines when touch is cancelled", function() {
					touchStart(10, 40);
					touchMove(5, 20);
					touchCancel(5, 20);
					touchMove(50, 60);

					expect(lineSegments()).to.eql([
						[10, 40, 5, 20]
					]);
				});

				it("does not scroll or zoom the page when user is drawing with finger", function() {
					oldDrawingArea.on("touchstart", function(event) {
						expect(event.isDefaultPrevented()).to.be(true);
					});
					touchStart(10, 40);
					touchMove(5, 20);
					touchEnd(5, 20);
				});

				it("stops drawing when multiple touches occur", function() {
					touchStart(10, 40);
					touchMove(5, 20);
					multipleTouchStart(5, 20, 6, 60);
					multipleTouchMove(1, 10, 7, 70);
					multipleTouchEnd(1, 10, 7, 70);

					expect(lineSegments()).to.eql([
						[10, 40, 5, 20]
					]);
				});
			});
		}

		function touchStart(relativeX, relativeY) {
			sendSingleTouchEvent("touchstart", relativeX, relativeY);
		}

		function touchMove(relativeX, relativeY) {
			sendSingleTouchEvent("touchmove", relativeX, relativeY);
		}

		function touchEnd(relativeX, relativeY) {
			sendSingleTouchEvent("touchend", relativeX, relativeY);
		}

		function touchCancel(relativeX, relativeY) {
			sendSingleTouchEvent("touchcancel", relativeX, relativeY);
		}

		function multipleTouchStart(relative1X, relative1Y, relative2X, relative2Y) {
			sendMultiTouchEvent("touchstart", relative1X, relative1Y, relative2X, relative2Y);
		}

		function multipleTouchMove(relative1X, relative1Y, relative2X, relative2Y) {
			sendMultiTouchEvent("touchmove", relative1X, relative1Y, relative2X, relative2Y);
		}

		function multipleTouchEnd(relative1X, relative1Y, relative2X, relative2Y) {
			sendMultiTouchEvent("touchend", relative1X, relative1Y, relative2X, relative2Y);
		}

		function sendSingleTouchEvent(event, relativeX, relativeY) {
			var jqElement = oldDrawingArea;

			var touch = createTouch(jqElement, drawingArea.pageOffset(relativeX, relativeY));
			sendTouchEvent(event, new TouchList(touch), jqElement);
		}

		function sendMultiTouchEvent(event, relative1X, relative1Y, relative2X, relative2Y) {
			var jqElement = oldDrawingArea;

			var touch1 = createTouch(jqElement, drawingArea.pageOffset(relative1X, relative1Y));
			var touch2 = createTouch(jqElement, drawingArea.pageOffset(relative2X, relative2Y));
			sendTouchEvent(event, createTouchList(touch1, touch2), jqElement);
		}

		function sendTouchEvent(event, touchList, jqElement) {
			var touchEvent = document.createEvent("TouchEvent");
			touchEvent.initTouchEvent(
				event, // event type
				true, // canBubble
				true, // cancelable
				window, // DOM window
				null, // detail (not sure what this is)
				0, 0, // screenX/Y
				0, 0, // clientX/Y
				false, false, false, false, // meta keys (shift etc.)
				touchList, touchList, touchList
			);

			var eventData = new jQuery.Event("event");
			eventData.type = event;
			eventData.originalEvent = touchEvent;
			jqElement.trigger(eventData);
		}

		function createTouchList(touchA, touchB) {
			if (touchB === null) return new TouchList(touchA);
			else return new TouchList(touchA, touchB);
		}

		function createTouch(jqElement, pageOffset) {
			var target = jqElement[0];
			var identifier = 0;
			var pageX = pageOffset.x;
			var pageY = pageOffset.y;
			var screenX = 0;
			var screenY = 0;

			var touch = new Touch(undefined, target, identifier, pageX, pageY, screenX, screenY);
			return touch;
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
