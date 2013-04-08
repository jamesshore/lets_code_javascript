// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global $ */

(function() {
	"use strict";


	describe("HtmlElement", function() {
		var htmlElement;

		beforeEach(function() {
			htmlElement = wwp.HtmlElement.fromHtml("<div></div>");
		});

		it("handles mouse events", function() {
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

		it("appends elements", function() {
			htmlElement.append(wwp.HtmlElement.fromHtml("<div></div>"));
			expect(htmlElement._element.children().length).to.equal(1);
		});

		it("removes elements", function() {
			var elementToAppend = wwp.HtmlElement.fromHtml("<div></div>");
			htmlElement.append(elementToAppend);
			elementToAppend.remove();
			expect(htmlElement._element.children().length).to.equal(0);
		});

		function testEvent(eventSender, eventHandler) {
			var eventOffset = null;
			eventSender.call(htmlElement, function(offset) {
				eventOffset = offset;
			});
			eventHandler.call(htmlElement, 42, 13);
			expect(eventOffset).to.eql({ x: 42, y: 13});
		}

		function browserSupportsTouchEvents() {
			return (typeof Touch !== "undefined");
		}


	});

}());