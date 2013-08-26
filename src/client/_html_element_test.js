// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global $ */

(function() {
	"use strict";

	var HtmlElement = require("./html_element.js");

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
			if (!browserSupportsTouchEvents()) return;

			testEvent(htmlElement.onSingleTouchStart, htmlElement.doSingleTouchStart);
			testEvent(htmlElement.onSingleTouchMove, htmlElement.doSingleTouchMove);
			testEvent(htmlElement.onSingleTouchEnd, htmlElement.doSingleTouchEnd);
			testEvent(htmlElement.onSingleTouchCancel, htmlElement.doSingleTouchCancel);
		});

		it("handles multi-touch events", function() {
			if (!browserSupportsTouchEvents()) return;

			var eventTriggered = false;
			htmlElement.onMultiTouchStart(function() {
				eventTriggered = true;
			});

			htmlElement.doMultiTouchStart(1, 2, 3, 4);
			expect(eventTriggered).to.be(true);
		});

		it("converts page coordinates into relative element coordinates", function() {
			try {
				htmlElement.appendSelfToBody();
				expect(htmlElement.relativeOffset({x: 100, y: 100})).to.eql({x: 92, y: 92});
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
				var body = new HtmlElement($(document.body));
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

		function browserSupportsTouchEvents() {
			return (typeof Touch !== "undefined") && ('ontouchstart' in window);
		}


	});

}());