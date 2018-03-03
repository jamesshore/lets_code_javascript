// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global Raphael, $ */

(function() {
	"use strict";

	var SvgCanvas = require("./svg_canvas.js");
	var HtmlElement = require("./html_element.js");
	var HtmlCoordinate = require("./html_coordinate.js");
	var browser = require("./browser.js");
	var failFast = require("fail_fast");
	var ClientDrawMessage = require("../../shared/client_draw_message.js");
	var ServerDrawMessage = require("../../shared/server_draw_message.js");
	var ClientPointerMessage = require("../../shared/client_pointer_message.js");
	var ServerPointerMessage = require("../../shared/server_pointer_message.js");
	var ClientRemovePointerMessage = require("../../shared/client_remove_pointer_message.js");
	var ServerRemovePointerMessage = require("../../shared/server_remove_pointer_message.js");
	var ClientClearScreenMessage = require("../../shared/client_clear_screen_message.js");
	var ServerClearScreenMessage = require("../../shared/server_clear_screen_message.js");

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

		network.connect(window.location.port);

		handlePointerMovement();
		handleClearScreenAction();
		handleDrawing();

		return svgCanvas;
	};

	exports.drawingAreaHasBeenRemovedFromDom = function() {
		svgCanvas = null;
	};


	//*** Pointers

	function handlePointerMovement() {
		documentBody.onMouseMove(sendPointerMessage);
		documentBody.onMouseLeave(sendRemovePointerMessage);
		drawingArea.onSingleTouchMove(sendPointerMessage);
		drawingArea.onTouchEnd(sendRemovePointerMessage);
		network.onMessage(ServerPointerMessage, displayNetworkPointer);
		network.onMessage(ServerRemovePointerMessage, removeNetworkPointer);
	}

	function sendPointerMessage(coordinate) {
		var relativeOffset = coordinate.toRelativeOffset(drawingArea);
		network.sendMessage(new ClientPointerMessage(relativeOffset.x, relativeOffset.y));
	}

	function sendRemovePointerMessage() {
		network.sendMessage(new ClientRemovePointerMessage());
	}

	function displayNetworkPointer(serverMessage) {
		var pointerElement = ghostPointerElements[serverMessage.id];
		if (pointerElement === undefined) {
			pointerElement = HtmlElement.appendHtmlToBody(pointerHtml);
			ghostPointerElements[serverMessage.id] = pointerElement;
		}
		pointerElement.setAbsolutePosition(HtmlCoordinate.fromRelativeOffset(drawingArea, serverMessage.x, serverMessage.y));
	}

	function removeNetworkPointer(serverMessage) {
		var pointerElement = ghostPointerElements[serverMessage.id];
		if (pointerElement === undefined) return;

		delete ghostPointerElements[serverMessage.id];
		pointerElement.remove();
	}


	//*** Clear Screen

	function handleClearScreenAction() {
		clearScreenButton.onMouseClick(clearDrawingAreaAndSendMessage);
		network.onMessage(ServerClearScreenMessage, clearDrawingArea);
	}

	function clearDrawingAreaAndSendMessage() {
		clearDrawingArea();
		network.sendMessage(new ClientClearScreenMessage());
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
		network.onMessage(ServerDrawMessage, function(message) {
			var from = HtmlCoordinate.fromRelativeOffset(drawingArea, message.from.x, message.from.y);
			var to = HtmlCoordinate.fromRelativeOffset(drawingArea, message.to.x, message.to.y);
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
			drawLineSegmentAndSendDrawMessage(start, end);
			start = end;
			lineDrawn = true;
		}
	}

	function endDrag() {
		if (!isCurrentlyDrawing()) return;

		if (!lineDrawn) drawLineSegmentAndSendDrawMessage(start, start);

		start = null;
		lineDrawn = false;
	}

	function isCurrentlyDrawing() {
		return start !== null;
	}

	function drawLineSegmentAndSendDrawMessage(start, end) {
		drawLineSegment(start, end);
		sendDrawMessage(start, end);
	}

	function drawLineSegment(start, end) {
		if (start.equals(end)) svgCanvas.drawDot(start);
		else svgCanvas.drawLine(start, end);
	}

	function sendDrawMessage(start, end) {
		var startOffset = start.toRelativeOffset(drawingArea);
		var endOffset = end.toRelativeOffset(drawingArea);
		network.sendMessage(new ClientDrawMessage(startOffset.x, startOffset.y, endOffset.x, endOffset.y));
	}

}());