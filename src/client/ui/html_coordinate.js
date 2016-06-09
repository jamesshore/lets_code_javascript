// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var failFast = require("../../shared/fail_fast.js");

	var HtmlCoordinate = module.exports = function HtmlCoordinate(pageX, pageY) {
		this._pageX = pageX;
		this._pageY = pageY;
	};

	HtmlCoordinate.fromPageOffset = function(x, y) {
		return new HtmlCoordinate(x, y);
	};

	HtmlCoordinate.prototype.toPageOffset = function() {
		return {
			x: this._pageX,
			y: this._pageY
		};
	};

	HtmlCoordinate.fromRelativeOffset = function(htmlElement, relativeX, relativeY) {
		failFastIfStylingPresent(htmlElement);

		var scroll = scrollOffset(htmlElement);
		var element = elementOffset(htmlElement);
		return new HtmlCoordinate(
			scroll.x + element.x + relativeX,
			scroll.y + element.y + relativeY
		);
	};

	HtmlCoordinate.prototype.toRelativeOffset = function(htmlElement) {
		failFastIfStylingPresent(htmlElement);

		var scroll = scrollOffset(htmlElement);
		var element = elementOffset(htmlElement);
		return {
			x: this._pageX - scroll.x - element.x,
			y: this._pageY - scroll.y - element.y
		};
	};

	HtmlCoordinate.prototype.equals = function(that) {
		failFast.unlessTrue(that instanceof HtmlCoordinate, "tried to compare HtmlCoordinate with a different type of object");

		return this._pageX === that._pageX && this._pageY === that._pageY;
	};

	HtmlCoordinate.prototype.toString = function() {
		return "[HtmlCoordinate page offset (" + this._pageX + ", " + this._pageY + ")]";
	};

	function scrollOffset(element) {
		var domElement = element.toDomElement();
		return {
			x: domElement.ownerDocument.defaultView.pageXOffset,
			y: domElement.ownerDocument.defaultView.pageYOffset
		};
	}

	function elementOffset(element) {
		var domElement = element.toDomElement();
		var elementPosition = domElement.getBoundingClientRect();
		return {
			x: elementPosition.left,
			y: elementPosition.top
		};
	}

	function failFastIfStylingPresent(element) {
		var style = window.getComputedStyle(element.toDomElement());

		failFastIfPaddingPresent("top");
		failFastIfPaddingPresent("left");
		failFastIfBorderPresent("top");
		failFastIfBorderPresent("left");

		function failFastIfPaddingPresent(side) {
			var css = style.getPropertyValue("padding-" + side);
			if (css !== "0px") throw new Error("HtmlCoordinate cannot convert relative offsets for elements that have padding (" + side + " padding was '" + css + "')");
		}

		function failFastIfBorderPresent(side) {
			var css = style.getPropertyValue("border-" + side + "-width");
			if (css !== "0px") throw new Error("HtmlCoordinate cannot convert relative offsets for elements that have border (" + side + " border was '" + css + "')");
		}
	}

}());