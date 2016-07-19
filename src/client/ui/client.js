// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global Raphael, $ */

(function() {
	"use strict";

	var SvgCanvas = require("./svg_canvas.js");
	var HtmlElement = require("./html_element.js");
	var HtmlCoordinate = require("./html_coordinate.js");
	var browser = require("./browser.js");
	var failFast = require("../../shared/fail_fast.js");

	var svgCanvas = null;
	var start = null;
	var lineDrawn = false;
	var drawingArea;
	var clearScreenButton;
	var documentBody;
	var windowElement;
	var network;

	exports.initializeDrawingArea = function(elements, realTimeConnection) {
		if (svgCanvas !== null) throw new Error("Client.js is not re-entrant");

		drawingArea = elements.drawingAreaDiv;
		clearScreenButton = elements.clearScreenButton;

		failFast.unlessDefined(drawingArea, "elements.drawingArea");
		failFast.unlessDefined(clearScreenButton, "elements.clearScreenButton");

		documentBody = new HtmlElement(document.body);
		windowElement = new HtmlElement(window);

		svgCanvas = new SvgCanvas(drawingArea);

		network = realTimeConnection;
		network.connect(window.location.port);

		drawingArea.preventBrowserDragDefaults();
		handleRealTimeNetwork();
		handleClearScreenClick();
		handleMouseDragEvents();
		handleTouchDragEvents();

		return svgCanvas;
	};

	exports.drawingAreaHasBeenRemovedFromDom = function() {
		svgCanvas = null;
	};

	function handleRealTimeNetwork() {
		documentBody.onMouseMove(function(coordinate) {
			var relativeOffset = coordinate.toRelativeOffset(drawingArea);
			network.sendPointerLocation(relativeOffset.x, relativeOffset.y);
		});
		documentBody.onSingleTouchMove(function(coordinate) {
			var relativeOffset = coordinate.toRelativeOffset(drawingArea);
			network.sendPointerLocation(relativeOffset.x, relativeOffset.y);
		});

		var allCursors = {};

		network.onPointerLocation(function(event) {
			var id = event.id;
			if (allCursors[id] === undefined) allCursors[id] = createCursor();
			moveCursor(allCursors[id], event.x, event.y);
		});

		function createCursor() {
			var cursor = HtmlElement.fromHtml("<div style='position:absolute;'><img src='/images/cursor.png' width='24px' height='24px'></div>");
			cursor.appendSelfToBody();
			return cursor;
		}

		function moveCursor(cursor, x, y) {
			var coordinate = HtmlCoordinate.fromRelativeOffset(drawingArea, x, y).toPageOffset();
			cursor.toDomElement().style.top = coordinate.y + "px";
			cursor.toDomElement().style.left = coordinate.x + "px";
		}
	}

	function handleClearScreenClick() {
		clearScreenButton.onMouseClick(function() {
			svgCanvas.clear();
		});
	}

	function handleMouseDragEvents() {
		drawingArea.onMouseDown(startDrag);
		documentBody.onMouseMove(continueDrag);
		windowElement.onMouseUp(endDrag);
	}

	function handleTouchDragEvents() {
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
			svgCanvas.drawLine(start, end);
			start = end;
			lineDrawn = true;
		}
	}

	function endDrag() {
		if (!isCurrentlyDrawing()) return;

		if (!lineDrawn) svgCanvas.drawDot(start);

		start = null;
		lineDrawn = false;
	}

	function isCurrentlyDrawing() {
		return start !== null;
	}

}());