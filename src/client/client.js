// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global dump*/

(function() {
	"use strict";

	$(function() {
		var div = document.createElement("div");
		div.setAttribute("id", "tdjs");
		div.setAttribute("foo", "bar");
		document.body.appendChild(div);

		dump("Window loaded");
	});

}());