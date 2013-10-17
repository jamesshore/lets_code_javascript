// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global $ */

(function() {
	"use strict";

	var HtmlElement = require("./html_element.js");
	var browser = require("./browser.js");

	describe("HtmlElement", function() {
		var htmlElement;

		beforeEach(function() {
			htmlElement = HtmlElement.fromHtml("<div></div>");
		});

		it("triggers mouse events relative to element and handles them relative to page", function() {
			testEvent(htmlElement.onSelectStart_ie8Only, htmlElement.doSelectStart);
			testEvent(htmlElement.onMouseDown, htmlElement.doMouseDown);
			testEvent(htmlElement.onMouseMove, htmlElement.doMouseMove);
			testEvent(htmlElement.onMouseLeave, htmlElement.doMouseLeave);
			testEvent(htmlElement.onMouseUp, htmlElement.doMouseUp);
		});

		it("handles single-touch events", function() {
			if (!browser.supportsTouchEvents()) return;
			testEvent(htmlElement.onSingleTouchStart, htmlElement.doSingleTouchStart);
			testEvent(htmlElement.onSingleTouchMove, htmlElement.doSingleTouchMove);
			testEvent(htmlElement.onSingleTouchEnd, htmlElement.doSingleTouchEnd);
			testEvent(htmlElement.onSingleTouchCancel, htmlElement.doSingleTouchCancel);
		});

		it("handles multi-touch events", function() {
			if (!browser.supportsTouchEvents()) return;
			var eventTriggered = false;
			htmlElement.onMultiTouchStart(function() {
				eventTriggered = true;
			});

			htmlElement.doMultiTouchStart(1, 2, 3, 4);
			expect(eventTriggered).to.be(true);
		});

		it("allows mouse events to be triggered without coordinates", function() {
			var eventPageOffset;
			htmlElement.onMouseDown(function(pageOffset) {
				eventPageOffset = pageOffset;
			});

			htmlElement.doMouseDown();
			expect(eventPageOffset).to.eql({ x: 0, y: 0 });
		});

		it("allows touch events to be triggered without coordinates", function() {
			if (!browser.supportsTouchEvents()) return;
			var eventPageOffset;
			htmlElement.onSingleTouchStart(function(pageOffset) {
				eventPageOffset = pageOffset;
			});

			htmlElement.doSingleTouchStart();
			expect(eventPageOffset).to.eql({ x: 0, y: 0 });
		});

		it("clears all event handlers (useful for testing)", function() {
			htmlElement.onMouseDown(function() {
				throw new Error("event handler should have been removed");
			});

			htmlElement.removeAllEventHandlers();
			htmlElement.doMouseDown(0, 0);
		});

		it("converts page coordinates into relative element coordinates", function() {
			try {
				htmlElement.appendSelfToBody();
				var offset = htmlElement.relativeOffset({x: 100, y: 150});

				if (browser.reportsElementPositionOffByOneSometimes()) {
					// compensate for off-by-one error in IE 8
					expect(offset.x).to.equal(92);
					expect(offset.y === 141 || offset.y === 142).to.be(true);
				}
				else {
					expect(offset).to.eql({x: 92, y: 142});
				}
			} finally {
				htmlElement.remove();
			}
		});

		it("converts relative coordinates into page coordinates", function() {
			try {
				htmlElement.appendSelfToBody();
				var offset = htmlElement.pageOffset({x: 100, y: 150});

				if (browser.reportsElementPositionOffByOneSometimes()) {
					// compensate for off-by-one error in IE 8
					expect(offset.x).to.equal(108);
					expect(offset.y === 158 || offset.y === 159).to.be(true);
				}
				else {
					expect(offset).to.eql({x: 108, y: 158});
				}
			} finally {
				htmlElement.remove();
			}
		});

		it("appends elements", function() {
			htmlElement.append(HtmlElement.fromHtml("<div></div>"));
			expect(htmlElement._element.children().length).to.equal(1);
		});

		it("appends to body", function() {
			try {
				var body = new HtmlElement(document.body);
				var childrenBeforeAppend = body._element.children().length;

				htmlElement.appendSelfToBody();
				var childrenAfterAppend = body._element.children().length;
				expect(childrenBeforeAppend + 1).to.equal(childrenAfterAppend);
			} finally {
				htmlElement.remove();
			}
		});

		it("removes elements", function() {
			var elementToAppend = HtmlElement.fromHtml("<div></div>");
			htmlElement.append(elementToAppend);
			elementToAppend.remove();
			expect(htmlElement._element.children().length).to.equal(0);
		});

		it("converts to DOM element", function() {
			var domElement = htmlElement.toDomElement();
			expect(domElement.tagName).to.equal("DIV");
		});

		function testEvent(eventSender, eventHandler) {
			try {
				htmlElement.appendSelfToBody();

				var eventPageOffset = null;
				eventSender.call(htmlElement, function(pageOffset) {
					eventPageOffset = pageOffset;
				});
				eventHandler.call(htmlElement, 42, 13);
				expect(htmlElement.relativeOffset(eventPageOffset)).to.eql({ x: 42, y: 13});
			}
			finally {
				htmlElement.remove();
			}
		}

	});

}());