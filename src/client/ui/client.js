// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global Raphael, $ */

(function() {
	"use strict";

	var SvgCanvas = require("./svg_canvas.js");
	var HtmlElement = require("./html_element.js");
	var HtmlCoordinate = require("./html_coordinate.js");
	var browser = require("./browser.js");
	var failFast = require("fail_fast");
	var ClientDrawEvent = require("../../shared/client_draw_event.js");
	var ServerDrawEvent = require("../../shared/server_draw_event.js");
	var ClientPointerEvent = require("../../shared/client_pointer_event.js");
	var ServerPointerEvent = require("../../shared/server_pointer_event.js");
	var ClientRemovePointerEvent = require("../../shared/client_remove_pointer_event.js");
	var ServerRemovePointerEvent = require("../../shared/server_remove_pointer_event.js");
	var ClientClearScreenEvent = require("../../shared/client_clear_screen_event.js");
	var ServerClearScreenEvent = require("../../shared/server_clear_screen_event.js");

	var svgCanvas = null;
	var start = null;
	var lineDrawn = false;
	var drawingArea;
	var clearScreenButton;
	var pointerHtml;
	var documentBody;
	var windowElement;
	var network;
	var ghostPointerElements;

	var debugEl;


	exports.initializeDrawingArea = function(elements, realTimeConnection) {
		if (svgCanvas !== null) throw new Error("Client.js is not re-entrant");

		drawingArea = elements.drawingAreaDiv;
		clearScreenButton = elements.clearScreenButton;
		pointerHtml = elements.pointerHtml;

		failFast.unlessDefined(drawingArea, "elements.drawingArea");
		failFast.unlessDefined(clearScreenButton, "elements.clearScreenButton");
		failFast.unlessDefined(pointerHtml, "elements.pointerHtml");

		documentBody = new HtmlElement(document.body);
		windowElement = new HtmlElement(window);
		svgCanvas = new SvgCanvas(drawingArea);
		network = realTimeConnection;
		ghostPointerElements = {};


		var clearEl = clearScreenButton.toDomElement()

		debugEl = HtmlElement.appendHtmlToBody(
			"<p style='position:absolute; top: 200px; left: 10px; border: solid black 1px;'>DEBUG</p>"
		).toDomElement();


		function onTouchClick(element, doSomething) {
			var clickInProgress;
			element.addEventListener("touchstart", function(event) {
				if (event.touches.length !== 1) return;
				debug("TOUCH-CLICK STARTING");

				event.preventDefault();

				clickInProgress = true;
			});
			element.addEventListener("touchend", function(event) {
				if (!clickInProgress) return;
				debug("TOUCH-CLICK ENDING")

				clickInProgress = false;
				doSomething();
			});
		}
		onTouchClick(clearEl, function() {
			debug("CLEAR ELEMENT, TOUCH-CLICKED");
		});

		// documentBody.onMouseMove(function(coordinate) {
		// 	debug("BODY, MOUSE MOVE: " + coordinate);
		// });
		documentBody.onSingleTouchMove(function(coordinate) {
			debug("BODY, TOUCH MOVE: " + coordinate);
		});
		documentBody.onTouchEnd(function(coordinate) {
			debug("BODY, TOUCH END: " + coordinate);
		});
		documentBody.onMouseDown(function(coordinate) {
			debug("BODY, MOUSE DOWN: " + coordinate);
		});
		documentBody.onMouseUp(function(coordinate) {
			debug("BODY, MOUSE UP: " + coordinate);
		});
		documentBody.onMouseClick(function(coordinate) {
			debug("BODY, MOUSE CLICK: " + coordinate);
		});

		// clearScreenButton.onMouseMove(function(coordinate) {
		// 	debug("CLEAR BUTTON, MOUSE MOVE: " + coordinate);
		// });
		clearScreenButton.onSingleTouchStart(function(coordinate) {
			debug("CLEAR BUTTON, TOUCH START: " + coordinate);
		});
		clearScreenButton.onSingleTouchMove(function(coordinate) {
			debug("CLEAR BUTTON, TOUCH MOVE: " + coordinate);
		});
		clearScreenButton.onTouchEnd(function(coordinate) {
			debug("CLEAR BUTTON, TOUCH END: " + coordinate);
		});
		clearScreenButton.onMouseDown(function(coordinate) {
			debug("CLEAR BUTTON, MOUSE DOWN: " + coordinate);
		});
		clearScreenButton.onMouseUp(function(coordinate) {
			debug("CLEAR BUTTON, MOUSE UP: " + coordinate);
		});
		clearScreenButton.onMouseClick(function(coordinate) {
			debug("CLEAR BUTTON, MOUSE CLICK: " + coordinate);
		});




		network.connect(window.location.port);

		handlePointerMovement();
		handleClearScreenAction();
		handleDrawing();

		return svgCanvas;
	};

	exports.drawingAreaHasBeenRemovedFromDom = function() {
		svgCanvas = null;
	};

	function debug(html) {
		debugEl.innerHTML = html + "<br />" + debugEl.innerHTML;
	}


	//*** Pointers

	function handlePointerMovement() {
		documentBody.onMouseMove(sendPointerEvent);
		documentBody.onMouseLeave(sendRemovePointerEvent);
		drawingArea.onSingleTouchMove(sendPointerEvent);
		drawingArea.onTouchEnd(sendRemovePointerEvent);
		network.onEvent(ServerPointerEvent, displayNetworkPointer);
		network.onEvent(ServerRemovePointerEvent, removeNetworkPointer);
	}



	function sendPointerEvent(coordinate) {
		var relativeOffset = coordinate.toRelativeOffset(drawingArea);
		network.sendEvent(new ClientPointerEvent(relativeOffset.x, relativeOffset.y));
	}

	function sendRemovePointerEvent() {
		network.sendEvent(new ClientRemovePointerEvent());
	}

	function displayNetworkPointer(serverEvent) {
		var pointerElement = ghostPointerElements[serverEvent.id];
		if (pointerElement === undefined) {
			pointerElement = HtmlElement.appendHtmlToBody(pointerHtml);
			ghostPointerElements[serverEvent.id] = pointerElement;
		}
		pointerElement.setAbsolutePosition(HtmlCoordinate.fromRelativeOffset(drawingArea, serverEvent.x, serverEvent.y));
	}

	function removeNetworkPointer(serverEvent) {
		var pointerElement = ghostPointerElements[serverEvent.id];
		if (pointerElement === undefined) return;

		delete ghostPointerElements[serverEvent.id];
		pointerElement.remove();
	}


	//*** Clear Screen

	function handleClearScreenAction() {
		clearScreenButton.onMouseClick(clearDrawingAreaAndSendEvent);
		network.onEvent(ServerClearScreenEvent, clearDrawingArea);
	}

	function clearDrawingAreaAndSendEvent() {
		clearDrawingArea();
		network.sendEvent(new ClientClearScreenEvent());
	}

	function clearDrawingArea() {
		svgCanvas.clear();
	}


	//*** Drawing

	function handleDrawing() {
		drawingArea.preventBrowserDragDefaults();
		handleMouseDragGesture();
		handleTouchDragGesture();
		handleNetworkDrawing();
	}

	function handleNetworkDrawing() {
		network.onEvent(ServerDrawEvent, function(event) {
			var from = HtmlCoordinate.fromRelativeOffset(drawingArea, event.from.x, event.from.y);
			var to = HtmlCoordinate.fromRelativeOffset(drawingArea, event.to.x, event.to.y);
			drawLineSegment(from, to);
		});
	}

	function handleMouseDragGesture() {
		drawingArea.onMouseDown(startDrag);
		documentBody.onMouseMove(continueDrag);
		windowElement.onMouseUp(endDrag);
	}

	function handleTouchDragGesture() {
		drawingArea.onSingleTouchStart(startDrag);
		drawingArea.onSingleTouchMove(continueDrag);
		drawingArea.onTouchEnd(endDrag);
		drawingArea.onTouchCancel(endDrag);

		drawingArea.onMultiTouchStart(endDrag);
	}

	function startDrag(coordinate) {
		start = coordinate;
	}

	function continueDrag(coordinate) {
		if (!isCurrentlyDrawing()) return;

		var end = coordinate;
		if (!start.equals(end)) {
			drawLineSegmentAndSendDrawEvent(start, end);
			start = end;
			lineDrawn = true;
		}
	}

	function endDrag() {
		if (!isCurrentlyDrawing()) return;

		if (!lineDrawn) drawLineSegmentAndSendDrawEvent(start, start);

		start = null;
		lineDrawn = false;
	}

	function isCurrentlyDrawing() {
		return start !== null;
	}

	function drawLineSegmentAndSendDrawEvent(start, end) {
		drawLineSegment(start, end);
		sendDrawEvent(start, end);
	}

	function drawLineSegment(start, end) {
		if (start.equals(end)) svgCanvas.drawDot(start);
		else svgCanvas.drawLine(start, end);
	}

	function sendDrawEvent(start, end) {
		var startOffset = start.toRelativeOffset(drawingArea);
		var endOffset = end.toRelativeOffset(drawingArea);
		network.sendEvent(new ClientDrawEvent(startOffset.x, startOffset.y, endOffset.x, endOffset.y));
	}

}());