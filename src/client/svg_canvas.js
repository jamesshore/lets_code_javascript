// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*global Raphael */

window.wwp = window.wwp || {};

(function() {
	"use strict";

	var SvgCanvas = wwp.SvgCanvas = function(htmlElement) {
		this._paper = new Raphael(htmlElement._element[0]);
	};

	SvgCanvas.prototype.drawLine = function(startX, startY, endX, endY) {
		this._paper.path("M" + startX + "," + startY + "L" + endX + "," + endY);
	};

}());