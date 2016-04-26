// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var failFast = require("../../shared/fail_fast.js");

	var HtmlCoordinate = module.exports = function HtmlCoordinate(element, relativeX, relativeY) {
		this._element = element;
		this._relativeX = relativeX;
		this._relativeY = relativeY;
	};

	HtmlCoordinate.fromRelativeOffset = function(element, x, y) {
		return new HtmlCoordinate(element, x, y);
	};

	HtmlCoordinate.fromPageOffset = function(element, x, y) {
		var relativeCoords = relativeOffset(element._element, x, y);
		return new HtmlCoordinate(element, relativeCoords.x, relativeCoords.y);
	};

	HtmlCoordinate.prototype.toRelativeX = function() {
			return this._relativeX;
		};

	HtmlCoordinate.prototype.toRelativeY = function() {
		return this._relativeY;
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
			if (css !== "0px") throw new Error("Do not apply padding to elements used with relativeOffset() (expected 0px but was " + css + ")");
		}

		function failFastIfBorderPresent(side) {
			var css = $element.css("border-" + side + "-width");
			if (css !== "0px") throw new Error("Do not apply border to elements used with relativeOffset() (expected 0px but was " + css + ")");
		}
	}

}());