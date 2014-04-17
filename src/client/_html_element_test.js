// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.

(function() {
	"use strict";

	var HtmlElement = require("./html_element.js");
	var browser = require("./browser.js");

	describe("HtmlElement", function() {
		var windowElement;
		var bodyElement;
		var htmlElement;

		beforeEach(function() {
			windowElement = new HtmlElement(window);
			bodyElement = new HtmlElement(document.body);
			htmlElement = HtmlElement.fromHtml("<div></div>");
		});

		afterEach(function() {
			if (browser.supportsCaptureApi()) htmlElement.releaseCapture();
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

					expectEventToBePrevented("selectstart", htmlElement.triggerSelectStart);   // required for IE 8 text dragging
					expectEventToBePrevented("mousedown", htmlElement.triggerMouseDown);
					if (browser.supportsTouchEvents()) {
						expectEventToBePrevented("touchstart", htmlElement.triggerSingleTouchStart);
						expectEventToBePrevented("touchstart", htmlElement.triggerMultiTouchStart);
					}

					function expectEventToBePrevented(event, eventTriggerFn) {
						var monitor = monitorEvent(event);
						htmlElement._element.trigger(event);
						expect(monitor.defaultPrevented).to.be(true);
					}
				});

				it("reports whether drag-related defaults have been prevented", function() {
					expect(htmlElement.isBrowserDragDefaultsPrevented()).to.be(false);
					htmlElement.preventBrowserDragDefaults();
					expect(htmlElement.isBrowserDragDefaultsPrevented()).to.be(true);
				});
			});

			describe("mouse events", function() {
				it("can be triggered with coordinates relative to the element", function() {
					checkEventTrigger(htmlElement.triggerMouseClick, "click");
					checkEventTrigger(htmlElement.triggerMouseDown, "mousedown");
					checkEventTrigger(htmlElement.triggerMouseMove, "mousemove");
					checkEventTrigger(htmlElement.triggerMouseLeave, "mouseleave");
					checkEventTrigger(htmlElement.triggerMouseUp, "mouseup");

					function checkEventTrigger(eventTriggerFn, event) {
						var monitor = monitorEvent(event);
						eventTriggerFn.call(htmlElement, 4, 7);

						var expectedPageCoordinates = htmlElement.pageOffset({ x: 4, y: 7 });
						expect(monitor.pageCoordinates).to.eql([ expectedPageCoordinates.x, expectedPageCoordinates.y ]);
					}
				});

				it("can be triggered without coordinates", function() {
					checkEventTrigger(htmlElement.triggerMouseClick, "click");
					checkEventTrigger(htmlElement.triggerMouseDown, "mousedown");
					checkEventTrigger(htmlElement.triggerMouseMove, "mousemove");
					checkEventTrigger(htmlElement.triggerMouseLeave, "mouseleave");
					checkEventTrigger(htmlElement.triggerMouseUp, "mouseup");

					function checkEventTrigger(eventTriggerFn, event) {
						var monitor = monitorEvent(event);
						eventTriggerFn.call(htmlElement);
						expect(monitor.pageCoordinates).to.eql([ 0, 0 ]);
					}
				});

				it("handlers receive coordinates relative to the page", function() {
					checkEventHandler(htmlElement.onMouseClick, htmlElement.triggerMouseClick);
					checkEventHandler(htmlElement.onMouseDown, htmlElement.triggerMouseDown);
					checkEventHandler(htmlElement.onMouseMove, htmlElement.triggerMouseMove);
					checkEventHandler(htmlElement.onMouseLeave, htmlElement.triggerMouseLeave);
					checkEventHandler(htmlElement.onMouseUp, htmlElement.triggerMouseUp);

					function checkEventHandler(eventHandlerFn, eventTriggerFn) {
						var monitor = monitorEventHandler(htmlElement, eventHandlerFn);
						eventTriggerFn.call(htmlElement, 60, 40);

						var expectedPageCoordinates = htmlElement.pageOffset({ x: 60, y: 40 });
						expect(monitor.eventTriggeredAt).to.eql(expectedPageCoordinates);
					}
				});

				it("simulates buggy IE 8 behavior (where mouse events on window aren't sent to window object)", function() {
					if (!browser.doesNotHandlesUserEventsOnWindow()) return;

					var monitor = monitorEventHandler(windowElement, windowElement.onMouseUp);
					windowElement.triggerMouseUp();
					expect(monitor.eventTriggered).to.be(false);
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
						expect(monitor.touches).to.eql([]);
					}
				});

				it("sends single-touch events relative to triggering element", function() {
					checkEventTrigger(htmlElement.triggerSingleTouchStart, "touchstart");
					checkEventTrigger(htmlElement.triggerSingleTouchMove, "touchmove");

					function checkEventTrigger(eventTriggerFn, event) {
						var monitor = monitorEvent(event);
						eventTriggerFn.call(htmlElement, 4, 7);

						var expectedPageCoordinates = htmlElement.pageOffset({ x: 4, y: 7 });
						expect(monitor.touches).to.eql([[ expectedPageCoordinates.x, expectedPageCoordinates.y ]]);
					}
				});

				it("can send single-touch events without coordinates", function() {
					checkEventTrigger(htmlElement.triggerSingleTouchStart, "touchstart");
					checkEventTrigger(htmlElement.triggerSingleTouchMove, "touchmove");

					function checkEventTrigger(eventTriggerFn, event) {
						var monitor = monitorEvent(event);
						eventTriggerFn.call(htmlElement);
						expect(monitor.touches).to.eql([[ 0, 0 ]]);
					}
				});

				it("sends multi-touch events relative to triggering element", function() {
					checkEventTrigger(htmlElement.triggerMultiTouchStart, "touchstart");

					function checkEventTrigger(eventTriggerFn, event) {
						var monitor = monitorEvent(event);
						eventTriggerFn.call(htmlElement, 10, 20, 30, 40);

						var expectedFirstTouch = htmlElement.pageOffset({ x: 10, y: 20 });
						var expectedSecondTouch = htmlElement.pageOffset({ x: 30, y: 40 });
						expect(monitor.touches).to.eql([
							[ expectedFirstTouch.x, expectedFirstTouch.y ],
							[ expectedSecondTouch.x, expectedSecondTouch.y ]
						]);
					}
				});

				it("handles zero-touch events", function() {
					checkEventHandler(htmlElement.onTouchEnd, htmlElement.triggerTouchEnd);
					checkEventHandler(htmlElement.onTouchCancel, htmlElement.triggerTouchCancel);

					function checkEventHandler(eventHandlerFn, eventTriggerFn) {
						var monitor = monitorEventHandler(htmlElement, eventHandlerFn);
						eventTriggerFn.call(htmlElement);
						expect(monitor.eventTriggered).to.be(true);
						expect(monitor.eventTriggeredAt).to.be(undefined);
					}
				});

				it("handles single-touch events", function() {
					checkEventHandler(htmlElement.onSingleTouchStart, htmlElement.triggerSingleTouchStart);
					checkEventHandler(htmlElement.onSingleTouchMove, htmlElement.triggerSingleTouchMove);

					function checkEventHandler(eventHandlerFn, eventTriggerFn) {
						var monitor = monitorEventHandler(htmlElement, eventHandlerFn);
						eventTriggerFn.call(htmlElement, 60, 40);

						var expectedPageCoordinates = htmlElement.pageOffset({ x: 60, y: 40 });
						expect(monitor.eventTriggeredAt).to.eql(expectedPageCoordinates);
					}
				});

				it("handles multi-touch events (but doesn't provide coordinates)", function() {
					checkEventHandler(htmlElement.onMultiTouchStart, htmlElement.triggerMultiTouchStart);

					function checkEventHandler(eventHandlerFn, eventTriggerFn) {
						var monitor = monitorEventHandler(htmlElement, eventHandlerFn);
						eventTriggerFn.call(htmlElement, 1, 2, 3, 4);

						expect(monitor.eventTriggered).to.be(true);
						expect(monitor.eventTriggeredAt).to.be(undefined);
					}
				});
			});

			describe("Capture API", function() {
				if (!browser.supportsCaptureApi()) return;

				afterEach(function() {
					htmlElement.releaseCapture();
				});

				it("emulates behavior of setCapture() (on browsers that support it)", function() {
					var monitor = monitorEventHandler(htmlElement, htmlElement.onMouseMove);
					htmlElement.setCapture();
					bodyElement.triggerMouseMove();
					expect(monitor.eventTriggered).to.be(true);
				});

				it("emulates behavior of releaseCapture() (on browsers that support it)", function() {
					var monitor = monitorEventHandler(htmlElement, htmlElement.onMouseMove);
					htmlElement.setCapture();
					htmlElement.releaseCapture();
					bodyElement.triggerMouseMove();
					expect(monitor.eventTriggered).to.be(false);
				});

				it("when event triggered, event coordinates are relative to triggering element, not capturing element", function() {
					var expectedPageCoordinates = bodyElement.pageOffset({ x: 30, y: 20 });

					var monitor = monitorEventHandler(htmlElement, htmlElement.onMouseMove);
					htmlElement.setCapture();
					bodyElement.triggerMouseMove(30, 20);
					expect(monitor.eventTriggeredAt).to.eql(expectedPageCoordinates);
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
					monitor.pageCoordinates = [ event.pageX, event.pageY ];
					monitor.defaultPrevented = event.isDefaultPrevented();

					if (event.originalEvent) {
						var eventTouches = event.originalEvent.touches;
						monitor.touches = [];
						for (var i = 0; i < eventTouches.length; i++) {
							monitor.touches.push([ eventTouches[i].pageX, eventTouches[i].pageY ]);
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
				expect(element.getDimensions()).to.eql({
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
				expect(element.getDimensions()).to.eql({
					width: 120,
					height: 80
				});
			});
		});

		describe("coordinate conversion", function() {

			var COLLAPSING_BODY_MARGIN = 8;

			beforeEach(function() {
				htmlElement.appendSelfToBody();
			});

			afterEach(function() {
				htmlElement.remove();
			});

			it("converts page coordinates into relative element coordinates", function() {
				var offset = htmlElement.relativeOffset({x: 100, y: 150});
				assertRelativeOffsetEquals(offset, 92, 142);
			});

			it("converts relative coordinates into page coordinates", function() {
				var offset = htmlElement.relativeOffset({x: 100, y: 150});
				assertPageOffsetEquals(offset, 92, 142);
			});

			it("page coordinate conversion accounts for margin", function() {
				checkRelativeStyle("margin-top: 13px;", 0, 13 - COLLAPSING_BODY_MARGIN);
				checkRelativeStyle("margin-left: 13px;", 13, 0);
				checkRelativeStyle("margin: 13px;", 13, 13 - COLLAPSING_BODY_MARGIN);
				checkRelativeStyle("margin: 1em; font-size: 16px", 16, 16 - COLLAPSING_BODY_MARGIN);
			});

			it("relative coordinate conversion accounts for margin", function() {
				checkPageStyle("margin-top: 13px;", 0, 13 - COLLAPSING_BODY_MARGIN);
				checkPageStyle("margin-left: 13px;", 13, 0);
				checkPageStyle("margin: 13px;", 13, 13 - COLLAPSING_BODY_MARGIN);
				checkPageStyle("margin: 1em; font-size: 16px", 16, 16 - COLLAPSING_BODY_MARGIN);
			});

			it("page coordinate conversion fails fast if there is any padding", function() {
				expectFailFast("padding-top: 13px;");
				expectFailFast("padding-left: 13px;");
				expectFailFast("padding: 13px;");
				expectFailFast("padding: 1em; font-size: 16px");

				// IE 8 weirdness
				expectFailFast("padding-top: 20%");
				expectFailFast("padding-left: 20%");
			});

			it("page coordinate conversion fails fast if there is any border", function() {
				expectFailFast("border-top: 13px solid;");
				expectFailFast("border-left: 13px solid;");
				expectFailFast("border: 13px solid;");
				expectFailFast("border: 1em solid; font-size: 16px");

				// IE 8 weirdness
				expectFailFast("border: thin solid");
				expectFailFast("border: medium solid");
				expectFailFast("border: thick solid");
				checkRelativeStyle("border: 13px none", 0, 0);
				checkPageStyle("border: 13px none", 0, 0);
			});

			function expectFailFast(elementStyle) {
				var styledElement = HtmlElement.fromHtml("<div style='" + elementStyle + "'></div>");
				try {
					styledElement.appendSelfToBody();
					expect(function() {
						styledElement.relativeOffset({ x: 100, y: 150 });
					}).to.throwException();
					expect(function() {
						styledElement.pageOffset({ x: 100, y: 150 });
					}).to.throwException();
				}
				finally {
					styledElement.remove();
				}
			}

			function checkRelativeStyle(elementStyle, additionalXOffset, additionalYOffset) {
				var BASE_STYLE = "width: 120px; height: 80px; border: 0px none;";

				var unstyledElement = HtmlElement.fromHtml("<div style='" + BASE_STYLE + "'></div>");
				unstyledElement.appendSelfToBody();
				var unstyledOffset = unstyledElement.relativeOffset({x: 100, y: 150});
				unstyledElement.remove();

				var styledElement = HtmlElement.fromHtml("<div style='" + BASE_STYLE + elementStyle + "'></div>");
				try {
					styledElement.appendSelfToBody();
					var styledOffset = styledElement.relativeOffset({x: 100, y: 150});
					assertRelativeOffsetEquals(
						styledOffset,
						unstyledOffset.x - additionalXOffset,
						unstyledOffset.y - additionalYOffset
					);
				}
				finally {
					styledElement.remove();
				}
			}

			function checkPageStyle(elementStyle, additionalXOffset, additionalYOffset) {
				var BASE_STYLE = "width: 120px; height: 80px; border: 0px none;";

				var unstyledElement = HtmlElement.fromHtml("<div style='" + BASE_STYLE + "'></div>");
				unstyledElement.appendSelfToBody();
				var unstyledOffset = unstyledElement.pageOffset({x: 100, y: 150});
				unstyledElement.remove();

				var styledElement = HtmlElement.fromHtml("<div style='" + BASE_STYLE + elementStyle + "'></div>");
				try {
					styledElement.appendSelfToBody();
					var styledOffset = styledElement.pageOffset({x: 100, y: 150});
					assertRelativeOffsetEquals(
						styledOffset,
						unstyledOffset.x + additionalXOffset,
						unstyledOffset.y + additionalYOffset
					);
				}
				finally {
					styledElement.remove();
				}
			}

			function assertRelativeOffsetEquals(actualOffset, expectedX, expectedY) {
				if (browser.reportsElementPositionOffByOneSometimes()) {
					// compensate for off-by-one error in IE 8
					expect(actualOffset.x).to.equal(expectedX);
					if (actualOffset.y !== expectedY - 1) {
						expect(actualOffset.y).to.equal(expectedY);
					}
				}
				else {
					expect(actualOffset).to.eql({x: expectedX, y: expectedY});
				}
			}
		});

		function assertPageOffsetEquals(actualOffset, expectedX, expectedY) {
			if (browser.reportsElementPositionOffByOneSometimes()) {
				// compensate for off-by-one error in IE 8
				expect(actualOffset.x).to.equal(expectedX);
				if (actualOffset.y !== expectedY + 1) {
					expect(actualOffset.y).to.equal(expectedY);
				}
			}
			else {
				expect(actualOffset).to.eql({x: expectedX, y: expectedY});
			}
		}


		describe("DOM manipulation", function() {

			it("creates element from raw HTML; also, converts to DOM element", function() {
				var element = HtmlElement.fromHtml("<code>foo</code>");

				var domElement = element.toDomElement();

				expect(domElement.outerHTML.toLowerCase()).to.equal("<code>foo</code>");

				// Ensure that fromHtml converts HTML to DOM element, not jQuery element
				expect(element._domElement).to.equal(domElement);
			});

			it("appends elements", function() {
				htmlElement.append(HtmlElement.fromHtml("<div></div>"));
				expect(htmlElement._element.children().length).to.equal(1);
			});

			it("appends to body", function() {
				try {
					var childrenBeforeAppend = bodyElement._element.children().length;

					htmlElement.appendSelfToBody();
					var childrenAfterAppend = bodyElement._element.children().length;
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
		});

	});

}());