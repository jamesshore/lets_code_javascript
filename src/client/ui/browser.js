// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*global Modernizr, $ */

(function() {
	"use strict";

	exports.supportsTouchEvents = function() {
		return askModernizr("touch");
		// return true;
	};

	exports.supportsTouchEventConstructor = function() {
		try {
			var unused = new TouchEvent("touchstart", {});
			return true;
		}
		catch (err) {
			if (!(err instanceof TypeError)) throw err;
			return false;
		}
	};

	exports.usesAndroidInitTouchEventParameterOrder = function() {
		var touchEvent = document.createEvent("TouchEvent");
		var touches = document.createTouchList();

		try {
			touchEvent.initTouchEvent(touches);
			return touchEvent.touches === touches;
		}
		catch (err) {
			if (!(err instanceof TypeError)) throw err;
			return false;
		}
	};

	function askModernizr(feature) {
		var result = Modernizr[feature];
		if (result === undefined) throw new Error(feature + " is not checked by the installed version of Modernizr");

		return result;
	}

}());