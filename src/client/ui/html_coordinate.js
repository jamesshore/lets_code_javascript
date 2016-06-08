// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var failFast = require("../../shared/fail_fast.js");

	var HtmlCoordinate = module.exports = function HtmlCoordinate(pageX, pageY) {
		this._pageX = pageX;
		this._pageY = pageY;
	};

	HtmlCoordinate.fromRelativeOffset = function(element, relativeX, relativeY) {
		var $element = element._element;
		failFastIfStylingPresent($element);

		var domElement = element.toDomElement();
		var elementPosition = domElement.getBoundingClientRect();
		var scrollX = domElement.ownerDocument.defaultView.pageXOffset;
		var scrollY = domElement.ownerDocument.defaultView.pageYOffset;

		var relativeOffset = {
			x: scrollX + elementPosition.left + relativeX,
			y: scrollY + elementPosition.top + relativeY
		};

		return new HtmlCoordinate(relativeOffset.x, relativeOffset.y);
	};

	HtmlCoordinate.fromPageOffset = function(x, y) {
		return new HtmlCoordinate(x, y);
	};

	HtmlCoordinate.prototype.toRelativeOffset = function(element) {
		return relativeOffset(element._element, this._pageX, this._pageY);
	};

	HtmlCoordinate.prototype.toPageOffset = function() {
		return {
			x: this._pageX,
			y: this._pageY
		};
	};

	HtmlCoordinate.prototype.equals = function(that) {
		failFast.unlessTrue(that instanceof HtmlCoordinate, "tried to compare HtmlCoordinate with a different type of object");

		return this._pageX === that._pageX && this._pageY === that._pageY;
	};

	HtmlCoordinate.prototype.toString = function() {
		return "[HtmlCoordinate page offset (" + this._pageX + ", " + this._pageY + ")]";
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
		var element = $element[0];
		failFastIfPaddingPresent("top");
		failFastIfPaddingPresent("left");
		failFastIfBorderPresent("top");
		failFastIfBorderPresent("left");

		function failFastIfPaddingPresent(side) {
			var css = element.style["padding-" + side];

			if (css !== "0px" && css !== "") throw new Error("Do not apply padding to elements used with relativeOffset() (expected 0px but was " + css + ")");
		}

		function failFastIfBorderPresent(side) {
			//var check = element.style["border-" + side + "-width"];
			//console.log(check);

			var css = $element.css("border-" + side + "-width");
			if (css !== "0px" && css !== "") throw new Error("Do not apply border to elements used with relativeOffset() (expected 0px but was " + css + ")");
		}
	}

}());