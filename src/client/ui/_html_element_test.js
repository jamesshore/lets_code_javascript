// Copyright (c) 2013-2016 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.

(function() {
	"use strict";

	var HtmlElement = require("./html_element.js");
	var HtmlCoordinate = require("./html_coordinate.js");
	var browser = require("./browser.js");
	var assert = require("../../shared/_assert.js");

	describe("UI: HtmlElement", function() {
		var windowElement;
		var bodyElement;
		var htmlElement;

		beforeEach(function() {
			windowElement = new HtmlElement(window);
			bodyElement = new HtmlElement(document.body);
			htmlElement = HtmlElement.fromHtml("<div></div>");
		});

		afterEach(function() {
			windowElement.removeAllEventHandlers();
			bodyElement.removeAllEventHandlers();
			htmlElement.removeAllEventHandlers();
		});

		describe("event handling", function() {

			beforeEach(function() {
				htmlElement.appendSelfToBody();
			});

			afterEach(function() {
				htmlElement.remove();
			});

			it("clears all event handlers (useful for testing)", function() {
				htmlElement.onMouseDown(function() {
					throw new Error("event handler should have been removed");
				});

				htmlElement.removeAllEventHandlers();
				htmlElement.triggerMouseDown(0, 0);
			});

			describe("default prevention", function() {
				it("allows drag-related browser defaults to be prevented", function() {
					htmlElement.preventBrowserDragDefaults();

					assertEventPrevented("selectstart", htmlElement.triggerSelectStart);   // required for IE 8 text dragging
					assertEventPrevented("mousedown", htmlElement.triggerMouseDown);
					if (browser.supportsTouchEvents()) {
						assertEventPrevented("touchstart", htmlElement.triggerSingleTouchStart);
						assertEventPrevented("touchstart", htmlElement.triggerMultiTouchStart);
					}

					function assertEventPrevented(event, eventTriggerFn) {
						var monitor = monitorEvent(event);
						htmlElement._element.trigger(event);
						assert.equal(monitor.defaultPrevented, true);
					}
				});

				it("reports whether drag-related defaults have been prevented", function() {
					assert.equal(htmlElement.isBrowserDragDefaultsPrevented(), false);
					htmlElement.preventBrowserDragDefaults();
					assert.equal(htmlElement.isBrowserDragDefaultsPrevented(), true);
				});
			});

			describe("mouse events", function() {

				it("can be triggered without coordinates", function() {
					checkEventTrigger(htmlElement.triggerMouseClick, "click");
					checkEventTrigger(htmlElement.triggerMouseDown, "mousedown");
					checkEventTrigger(htmlElement.triggerMouseMove, "mousemove");
					checkEventTrigger(htmlElement.triggerMouseLeave, "mouseleave");
					checkEventTrigger(htmlElement.triggerMouseUp, "mouseup");

					function checkEventTrigger(eventTriggerFn, event) {
						var monitor = monitorEvent(event);
						eventTriggerFn.call(htmlElement);
						assert.deepEqual(monitor.pageCoordinates, { x: 0, y: 0 });
					}
				});

				it("can be triggered with coordinates relative to the element", function() {
					checkEventTrigger(htmlElement.triggerMouseClick, "click");
					checkEventTrigger(htmlElement.triggerMouseDown, "mousedown");
					checkEventTrigger(htmlElement.triggerMouseMove, "mousemove");
					checkEventTrigger(htmlElement.triggerMouseLeave, "mouseleave");
					checkEventTrigger(htmlElement.triggerMouseUp, "mouseup");

					function checkEventTrigger(eventTriggerFn, event) {
						var monitor = monitorEvent(event);
						eventTriggerFn.call(htmlElement, 4, 7);
						assert.deepEqual(
							monitor.pageCoordinates,
							HtmlCoordinate.fromRelativeOffset(htmlElement, 4, 7).toPageOffset()
						);
					}
				});

				it("can be triggered with HtmlCoordinate object", function() {
					checkEventTrigger(htmlElement.triggerMouseClick, "click");
					checkEventTrigger(htmlElement.triggerMouseDown, "mousedown");
					checkEventTrigger(htmlElement.triggerMouseMove, "mousemove");
					checkEventTrigger(htmlElement.triggerMouseLeave, "mouseleave");
					checkEventTrigger(htmlElement.triggerMouseUp, "mouseup");

					function checkEventTrigger(eventTriggerFn, event) {
						var monitor = monitorEvent(event);
						eventTriggerFn.call(htmlElement, HtmlCoordinate.fromPageOffset(13, 17));
						assert.deepEqual(monitor.pageCoordinates, { x: 13, y: 17 });
					}
				});

				it("handlers receive HtmlCoordinate object", function() {
					checkEventHandler(htmlElement.onMouseClick, htmlElement.triggerMouseClick);
					checkEventHandler(htmlElement.onMouseDown, htmlElement.triggerMouseDown);
					checkEventHandler(htmlElement.onMouseMove, htmlElement.triggerMouseMove);
					checkEventHandler(htmlElement.onMouseLeave, htmlElement.triggerMouseLeave);
					checkEventHandler(htmlElement.onMouseUp, htmlElement.triggerMouseUp);

					function checkEventHandler(eventHandlerFn, eventTriggerFn) {
						var monitor = monitorEventHandler(htmlElement, eventHandlerFn);

						var expectedCoordinate = HtmlCoordinate.fromPageOffset(60, 40);
						eventTriggerFn.call(htmlElement, expectedCoordinate);
						assert.objEqual(monitor.eventTriggeredAt, expectedCoordinate);
					}
				});

			});

			describe("touch events", function() {
				if (!browser.supportsTouchEvents()) return;

				it("sends zero touches when emulating the end of a touch", function() {
					checkEventTrigger("touchend", htmlElement.triggerTouchEnd);
					checkEventTrigger("touchcancel", htmlElement.triggerTouchCancel);

					function checkEventTrigger(event, eventTriggerFn) {
						var monitor = monitorEvent(event);
						eventTriggerFn.call(htmlElement);
						assert.deepEqual(monitor.touches, []);
					}
				});

				it("can send single-touch events without coordinates", function() {
					checkEventTrigger(htmlElement.triggerSingleTouchStart, "touchstart");
					checkEventTrigger(htmlElement.triggerSingleTouchMove, "touchmove");

					function checkEventTrigger(eventTriggerFn, event) {
						var monitor = monitorEvent(event);
						eventTriggerFn.call(htmlElement);
						assert.deepEqual(monitor.touches, [{ x: 0, y: 0 }]);
					}
				});

				it("can send single-touch events relative to triggering element", function() {
					checkEventTrigger(htmlElement.triggerSingleTouchStart, "touchstart");
					checkEventTrigger(htmlElement.triggerSingleTouchMove, "touchmove");

					function checkEventTrigger(eventTriggerFn, event) {
						var monitor = monitorEvent(event);
						eventTriggerFn.call(htmlElement, 4, 7);

						var expectedPageCoordinates = HtmlCoordinate.fromRelativeOffset(htmlElement, 4, 7).toPageOffset();
						assert.deepEqual(monitor.touches, [ expectedPageCoordinates ]);
					}
				});

				it("can send single-touch events with HtmlCoordinate object", function() {
					checkEventTrigger(htmlElement.triggerSingleTouchStart, "touchstart");
					checkEventTrigger(htmlElement.triggerSingleTouchMove, "touchmove");

					function checkEventTrigger(eventTriggerFn, event) {
						var monitor = monitorEvent(event);
						eventTriggerFn.call(htmlElement, HtmlCoordinate.fromPageOffset(13, 17));

						assert.deepEqual(monitor.touches, [{ x: 13, y: 17 }]);
					}
				});

				it("can send multi-touch events relative to triggering element", function() {
					checkEventTrigger(htmlElement.triggerMultiTouchStart, "touchstart");

					function checkEventTrigger(eventTriggerFn, event) {
						var monitor = monitorEvent(event);
						eventTriggerFn.call(htmlElement, 10, 20, 30, 40);

						var expectedFirstTouch = HtmlCoordinate.fromRelativeOffset(htmlElement, 10, 20).toPageOffset();
						var expectedSecondTouch = HtmlCoordinate.fromRelativeOffset(htmlElement, 30, 40).toPageOffset();
						assert.deepEqual(monitor.touches, [ expectedFirstTouch, expectedSecondTouch ]);
					}
				});

				it("can send multi-touch events using HtmlCoordinate objects", function() {
					checkEventTrigger(htmlElement.triggerMultiTouchStart, "touchstart");

					function checkEventTrigger(eventTriggerFn, event) {
						var monitor = monitorEvent(event);
						eventTriggerFn.call(
							htmlElement,
							HtmlCoordinate.fromPageOffset(10, 20),
							HtmlCoordinate.fromPageOffset(30, 40)
						);

						assert.deepEqual(monitor.touches, [
							{ x: 10, y: 20 },
							{ x: 30, y: 40 }
						]);
					}
				});

				it("handles zero-touch events", function() {
					checkEventHandler(htmlElement.onTouchEnd, htmlElement.triggerTouchEnd);
					checkEventHandler(htmlElement.onTouchCancel, htmlElement.triggerTouchCancel);

					function checkEventHandler(eventHandlerFn, eventTriggerFn) {
						var monitor = monitorEventHandler(htmlElement, eventHandlerFn);
						eventTriggerFn.call(htmlElement);
						assert.equal(monitor.eventTriggered, true);
						assert.equal(monitor.eventTriggeredAt, undefined);
					}
				});

				it("handles single-touch events", function() {
					checkEventHandler(htmlElement.onSingleTouchStart, htmlElement.triggerSingleTouchStart);
					checkEventHandler(htmlElement.onSingleTouchMove, htmlElement.triggerSingleTouchMove);

					function checkEventHandler(eventHandlerFn, eventTriggerFn) {
						var monitor = monitorEventHandler(htmlElement, eventHandlerFn);

						var expectedCoordinate = HtmlCoordinate.fromPageOffset(60, 40);
						eventTriggerFn.call(htmlElement, expectedCoordinate);
						assert.objEqual(monitor.eventTriggeredAt, expectedCoordinate);
					}
				});

				it("handles multi-touch events (but doesn't provide coordinates)", function() {
					checkEventHandler(htmlElement.onMultiTouchStart, htmlElement.triggerMultiTouchStart);

					function checkEventHandler(eventHandlerFn, eventTriggerFn) {
						var monitor = monitorEventHandler(htmlElement, eventHandlerFn);
						eventTriggerFn.call(htmlElement, 1, 2, 3, 4);

						assert.equal(monitor.eventTriggered, true);
						assert.equal(monitor.eventTriggeredAt, undefined);
					}
				});
			});

			function monitorEvent(event) {
				var monitor = {
					eventTriggered: false,
					touches: null,
					pageCoordinates: null,
					defaultPrevented: false
				};

				htmlElement._element.on(event, function(event) {
					monitor.eventTriggered = true;
					monitor.pageCoordinates = { x: event.pageX, y: event.pageY };
					monitor.defaultPrevented = event.isDefaultPrevented();

					if (event.originalEvent) {
						var eventTouches = event.originalEvent.touches;
						monitor.touches = [];
						for (var i = 0; i < eventTouches.length; i++) {
							monitor.touches.push({ x: eventTouches[i].pageX, y: eventTouches[i].pageY });
						}
					}
				});

				return monitor;
			}

			function monitorEventHandler(htmlElement, eventFunction) {
				var monitor = {
					eventTriggered: false
				};

				eventFunction.call(htmlElement, function(pageOffset) {
					monitor.eventTriggered = true;
					monitor.eventTriggeredAt = pageOffset;
				});
				return monitor;
			}
		});

		describe("sizing", function() {
			it("provides its dimensions", function() {
				var element = HtmlElement.fromHtml("<div style='width: 120px; height: 80px;'></div>");
				assert.deepEqual(element.getDimensions(), {
					width: 120,
					height: 80
				});
			});

			it("dimensions are not affected by padding, border, or margin", function() {
				var element = HtmlElement.fromHtml("<div style='" +
					"width: 120px; " +
					"height: 80px; " +
					"padding: 13px; " +
					"border: 7px; " +
					"margin: 19px; " +
					"'></div>");
				assert.deepEqual(element.getDimensions(), {
					width: 120,
					height: 80
				});
			});
		});

		describe("DOM manipulation", function() {

			it("creates element from raw HTML; also, converts to DOM element", function() {
				var element = HtmlElement.fromHtml("<code>foo</code>");

				var domElement = element.toDomElement();

				assert.equal(domElement.outerHTML.toLowerCase(), "<code>foo</code>");

				// Ensure that fromHtml converts HTML to DOM element, not jQuery element
				assert.equal(element._domElement, domElement);
			});

			it("creates element from raw HTML and appends it to the body", function() {
				try {
					var childrenBeforeAppend = bodyElement._element.children().length;

					var element = HtmlElement.appendHtmlToBody("<div>element</div>");
					assert.equal(element.toDomElement().outerHTML.toLowerCase(), "<div>element</div>");

					var childrenAfterAppend = bodyElement._element.children().length;
					assert.equal(childrenBeforeAppend + 1, childrenAfterAppend);
				} finally {
					htmlElement.remove();
				}
			});

			it("finds element by ID", function() {
				var expectedElement = HtmlElement.fromHtml("<div id='anElement'></div>");
				expectedElement.appendSelfToBody();

				var actualElement = HtmlElement.fromId("anElement");
				assert.equal(actualElement._domElement, expectedElement._domElement);
			});

			it("finding element by ID fails fast if ID not present", function() {
				assert.throws(function() {
					var element = HtmlElement.fromId("noSuchId");
				});
			});

			it("finds elements by selector", function() {
				var expectedElement1 = HtmlElement.appendHtmlToBody("<div class='aClass'>one</div>");
				var expectedElement2 = HtmlElement.appendHtmlToBody("<div class='aClass'>two</div>");
				try {
					var elements = HtmlElement.fromSelector(".aClass");
					assert.equal(elements.length, 2);
					assert.equal(elements[0].toDomElement(), expectedElement1.toDomElement());
					assert.equal(elements[1].toDomElement(), expectedElement2.toDomElement());
				}
				finally {
					expectedElement1.remove();
					expectedElement2.remove();
				}
			});

			it("appends elements", function() {
				htmlElement.append(HtmlElement.fromHtml("<div></div>"));
				assert.equal(htmlElement._element.children().length, 1);
			});

			it("appends to body", function() {
				try {
					var childrenBeforeAppend = bodyElement._element.children().length;

					htmlElement.appendSelfToBody();
					var childrenAfterAppend = bodyElement._element.children().length;
					assert.equal(childrenBeforeAppend + 1, childrenAfterAppend);
				} finally {
					htmlElement.remove();
				}
			});

			it("removes elements", function() {
				var elementToAppend = HtmlElement.fromHtml("<div></div>");
				htmlElement.append(elementToAppend);
				elementToAppend.remove();
				assert.equal(htmlElement._element.children().length, 0);
			});
		});

	});

}());