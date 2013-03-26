// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global describe, it, expect, beforeEach, wwp, $, dump */

(function() {
	"use strict";


	describe("DomElement", function() {
		var domElement;

		beforeEach(function() {
			domElement = wwp.DomElement.fromHtml("<div></div>");
		});

		it("handles mouse events", function() {
			testEvent(domElement.onSelectStart_ie8Only, domElement.doSelectStart);
			testEvent(domElement.onMouseDown, domElement.doMouseDown);
			testEvent(domElement.onMouseMove, domElement.doMouseMove);
			testEvent(domElement.onMouseLeave, domElement.doMouseLeave);
			testEvent(domElement.onMouseUp, domElement.doMouseUp);
		});

		it("handles touch events", function() {
			if (!browserSupportsTouchEvents()) return;

			testEvent(domElement.onSingleTouchStart, domElement.doSingleTouchStart);
			testEvent(domElement.onSingleTouchMove, domElement.doSingleTouchMove);
			testEvent(domElement.onSingleTouchEnd, domElement.doSingleTouchEnd);
			testEvent(domElement.onSingleTouchCancel, domElement.doSingleTouchCancel);
		});

		it("appends elements", function() {
			domElement.append(wwp.DomElement.fromHtml("<div></div>"));
			expect(domElement.element.children().length).to.equal(1);
		});

		function testEvent(eventSender, eventHandler) {
			var eventOffset = null;
			eventSender.call(domElement, function(offset) {
				eventOffset = offset;
			});
			eventHandler.call(domElement, 42, 13);
			expect(eventOffset).to.eql({ x: 42, y: 13});
		}

		function browserSupportsTouchEvents() {
			return (typeof Touch !== "undefined");
		}


	});

}());