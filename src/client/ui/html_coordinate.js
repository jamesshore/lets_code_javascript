// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var failFast = require("../../shared/fail_fast.js");

	var HtmlCoordinate = module.exports = function HtmlCoordinate(pageX, pageY) {
		this._pageX = pageX;
		this._pageY = pageY;
	};

	HtmlCoordinate.fromRelativeOffset = function(element, x, y) {
		var page = pageOffset(element._element, x, y);
		return new HtmlCoordinate(page.x, page.y);
	};

	HtmlCoordinate.fromPageOffset = function(element, x, y) {
		return new HtmlCoordinate(x, y);
	};

	HtmlCoordinate.prototype.toRelativeOffset = function(element) {
		return relativeOffset(element._element, this._pageX, this._pageY);
	};

	HtmlCoordinate.prototype.equals = function(that) {
		failFast.unlessTrue(that instanceof HtmlCoordinate, "tried to compare HtmlCoordinate with a different type of object");

		return this._pageX === that._pageX && this._pageY === that._pageY;
	};

	HtmlCoordinate.prototype.toString = function() {
		var x = this._pageX;
		var y = this._pageY;

		return "[HtmlCoordinate page offset (" + x + ", " + y + ")]";
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