// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*global Modernizr, $ */

(function() {
	"use strict";

	exports.supportsTouchEvents = function() {
		return askModernizr("touch");
	};

	exports.usesAndroidInitTouchEventParameterOrder = function() {
		var touchEvent = document.createEvent("TouchEvent");
		var touches = document.createTouchList();

		touchEvent.initTouchEvent(touches);

		return touchEvent.touches === touches;
	};

	function askModernizr(feature) {
		var result = Modernizr[feature];
		if (result === undefined) throw new Error(feature + " is not checked by the installed version of Modernizr");

		return result;
	}

}());