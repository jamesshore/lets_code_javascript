// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var failFast = require("../../shared/fail_fast.js");

	var HtmlCoordinate = module.exports = function HtmlCoordinate(element, relativeX, relativeY) {
		this._element = element;
		this._relativeX = relativeX;
		this._relativeY = relativeY;
	};

	HtmlCoordinate.fromRelativeCoords = function(element, x, y) {
		return new HtmlCoordinate(element, x, y);
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


}());