// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var failFast = require("../../shared/fail_fast.js");

	var HtmlCoordinate = module.exports = function HtmlCoordinate(element, relativeX, relativeY, pageX, pageY) {
		this._element = element;
		this._relativeX = relativeX;
		this._relativeY = relativeY;
		this._pageX = pageX;
		this._pageY = pageY;
	};

	HtmlCoordinate.fromRelativeOffset = function(element, x, y) {
		var page = pageOffset(element._element, x, y);
		return new HtmlCoordinate(element, x, y, page.x, page.y);
	};

	HtmlCoordinate.fromPageOffset = function(element, x, y) {
		var relativeCoords = relativeOffset(element._element, x, y);
		return new HtmlCoordinate(element, relativeCoords.x, relativeCoords.y, x, y);
	};

	HtmlCoordinate.prototype.toRelativeOffset = function(element) {
		return relativeOffset(element._element, this._pageX, this._pageY);
	};

	HtmlCoordinate.prototype.equals = function(that) {
		failFast.unlessTrue(that instanceof HtmlCoordinate, "tried to compare HtmlCoordinate with a different type of object");

		return this._element.toDomElement() === that._element.toDomElement() &&
			this._relativeX === that._relativeX &&
			this._relativeY === that._relativeY;
	};

	HtmlCoordinate.prototype.toString = function() {
		var x = this._relativeX;
		var y = this._relativeY;
		var tag = this._element.toDomElement().tagName.toLowerCase();

		return "[HtmlCoordinate (" + x + ", " + y + ") relative to <" + tag + ">]";
	};

	function pageOffset($element, relativeX, relativeY) {
		failFastIfStylingPresent($element);

		var topLeftOfDrawingArea = $element.offset();
		return {
			x: relativeX + topLeftOfDrawingArea.left,
			y: relativeY + topLeftOfDrawingArea.top
		};
	}

	function relativeOffset($element, pageX, pageY) {
		failFastIfStylingPresent($element);

		var pageOffset = $element.offset();
		return {
			x: pageX - pageOffset.left,
			y: pageY - pageOffset.top
		};
	}

	function failFastIfStylingPresent($element) {
		failFastIfPaddingPresent("top");
		failFastIfPaddingPresent("left");
		failFastIfBorderPresent("top");
		failFastIfBorderPresent("left");

		function failFastIfPaddingPresent(side) {
			var css = $element.css("padding-" + side);
			if (css !== "0px" && css !== "") throw new Error("Do not apply padding to elements used with relativeOffset() (expected 0px but was " + css + ")");
		}

		function failFastIfBorderPresent(side) {
			var css = $element.css("border-" + side + "-width");
			if (css !== "0px" && css !== "") throw new Error("Do not apply border to elements used with relativeOffset() (expected 0px but was " + css + ")");
		}
	}

}());