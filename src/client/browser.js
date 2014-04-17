// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*global Modernizr, $ */

(function() {
	"use strict";

	exports.supportsTouchEvents = function() {
		return Modernizr.touch;
	};

	exports.supportsCaptureApi = function() {
		return document.body.setCapture && document.body.releaseCapture;
	};

	exports.reportsElementPositionOffByOneSometimes = function() {
		return isIe8();
	};

	exports.doesNotHandlesUserEventsOnWindow = function() {
		return isIe8();
	};

	exports.doesNotComputeStyles = function() {
		return isIe8();
	};

	function isIe8() {
		return $.browser.msie && $.browser.version === "8.0";
	}

}());