// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*global $ */

(function() {
	"use strict";

	exports.supportsTouchEvents = function() {
		return (typeof Touch !== "undefined") && ('ontouchstart' in window);
	};

	exports.reportsElementPositionOffByOneSometimes = function() {
		return isIe8();
	};

	function isIe8() {
		return $.browser.msie && $.browser.version === "8.0";
	}

}());