// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
(function() {
	"use strict";

	exports.supportsTouchEvents = function() {
		return (typeof Touch !== "undefined") && ('ontouchstart' in window);
	};

}());