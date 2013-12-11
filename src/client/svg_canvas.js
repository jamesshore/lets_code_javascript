// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*global Raphael */

(function() {
	"use strict";

	var SvgCanvas = module.exports = function(htmlElement) {
		this._paper = new Raphael(htmlElement.toDomElement());
	};

	SvgCanvas.STROKE_WIDTH = 2;
	SvgCanvas.LINE_CAP = "round";

	SvgCanvas.prototype.drawLine = function(startX, startY, endX, endY) {
		if (startX === endX && startY === endY) {
			this._paper.circle(startX, startY, SvgCanvas.STROKE_WIDTH / 2)
				.attr({ "fill": "black"} );
			return;
		}

		this._paper.path("M" + startX + "," + startY + "L" + endX + "," + endY)
			.attr({
				"stroke-width": SvgCanvas.STROKE_WIDTH,
				"stroke-linecap": SvgCanvas.LINE_CAP
			});
	};

	SvgCanvas.prototype.height = function() {
		return this._paper.height;
	};

	SvgCanvas.prototype.width = function() {
		return this._paper.width;
	};
	
	SvgCanvas.prototype.lineSegments = function() {
		var result = [];
		this._paper.forEach(function(element) {
			result.push(normalizeToLineSegment(element));
		});
		return result;
	};

	SvgCanvas.prototype.lineSegmentsWithAttributes = function() {
		var result = [];
		this._paper.forEach(function(element) {
			var path = Raphael.svg ? element.node.attributes.d.value : element.node.path.value;
			result.push({
				path: path,
				attrs: element.attrs
			});
		});
		return result;
	};

	function normalizeToLineSegment(element) {
		switch(element.type) {
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
			element.attrs.cy,
			element.attrs.cx,
			element.attrs.cy,
		];
	}

	function normalizePath(element) {
		// SVG: [[ "M", 20, 30 ], [ "L", 30, 300 ]]
		// VML: "M20,30L30,300"

		if (Raphael.svg) return normalizeSvgPath(element);
		else if (Raphael.vml) return normalizeVmlPath(element);
		else throw new Error("Unknown Raphael rendering engine");
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

	function normalizeVmlPath(element) {
		// We're in IE 8, which uses format "m432000,648000 l648000,67456800 e"
		var VML_MAGIC_NUMBER = 21600;

		var path = element.node.path.value;

		var ie8PathRegex = /m(\d+),(\d+) l(\d+),(\d+) e/;
		var ie8 = path.match(ie8PathRegex);

		var startX = ie8[1] / VML_MAGIC_NUMBER;
		var startY = ie8[2] / VML_MAGIC_NUMBER;
		var endX = ie8[3] / VML_MAGIC_NUMBER;
		var endY = ie8[4] / VML_MAGIC_NUMBER;

		return [
			startX,
			startY,
			endX,
			endY
		];
	}

}());