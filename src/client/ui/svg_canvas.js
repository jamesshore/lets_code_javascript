// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*global Raphael */

(function() {
	"use strict";

	var SvgCanvas = module.exports = function(htmlElement) {
		var dimensions = htmlElement.getDimensions();
		this._paper = new Raphael(htmlElement.toDomElement(), dimensions.width, dimensions.height);
	};

	SvgCanvas.LINE_COLOR = "black";
	SvgCanvas.STROKE_WIDTH = 2;
	SvgCanvas.LINE_CAP = "round";

	SvgCanvas.prototype.clear = function() {
		this._paper.clear();
	};

	SvgCanvas.prototype.drawLine = function(start, end) {
		var startX = start.toRelativeX();
		var startY = start.toRelativeY();
		var endX = end.toRelativeX();
		var endY = end.toRelativeY();
		this._paper.path("M" + startX + "," + startY + "L" + endX + "," + endY)
			.attr({
				"stroke": SvgCanvas.LINE_COLOR,
				"stroke-width": SvgCanvas.STROKE_WIDTH,
				"stroke-linecap": SvgCanvas.LINE_CAP
			});
	};

	SvgCanvas.prototype.drawDot = function(x, y) {
		this._paper.circle(x, y, SvgCanvas.STROKE_WIDTH / 2)
			.attr({
				"stroke": SvgCanvas.LINE_COLOR,
				"fill": SvgCanvas.LINE_COLOR
			});
	};

	SvgCanvas.prototype.lineSegments = function() {
		var result = [];
		this._paper.forEach(function(element) {
			result.push(normalizeToLineSegment(element));
		});
		return result;
	};

	SvgCanvas.prototype.elementsForTestingOnly = function() {
		var result = [];
		this._paper.forEach(function(element) {
			result.push(element);
		});
		return result;
	};

	function normalizeToLineSegment(element) {
		switch (element.type) {
			case "path":
				return normalizePath(element);
			case "circle":
				return normalizeCircle(element);
			default:
				throw new Error("Unknown element type: " + element.type);
		}
	}

	function normalizeCircle(element) {
		return [
			element.attrs.cx,
			element.attrs.cy
		];
	}

	function normalizePath(element) {
		if (!Raphael.svg) throw new Error("Unknown Raphael rendering engine");

		return normalizeSvgPath(element);
	}

	function normalizeSvgPath(element) {
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

}());