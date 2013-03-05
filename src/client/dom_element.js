// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global wwp:true */

window.wwp = window.wwp || {};

(function() {
	"use strict";

	var DomElement = wwp.DomElement = function(jqueryElement) {
		this.element = jqueryElement;
	};

	DomElement.prototype.relativeOffset = function(pageX, pageY) {
		var pageOffset = this.element.offset();

		return {
			x: pageX - pageOffset.left,
			y: pageY - pageOffset.top
		};
	};

	DomElement.prototype.pageOffset = function(relativeX, relativeY) {
		var topLeftOfDrawingArea = this.element.offset();
		return {
			x: relativeX + topLeftOfDrawingArea.left,
			y: relativeY + topLeftOfDrawingArea.top
		};
	};

}());