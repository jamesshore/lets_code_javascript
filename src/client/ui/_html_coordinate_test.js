// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("../../shared/_assert.js");
	var HtmlCoordinate = require("./html_coordinate.js");

	describe("UI: HtmlCoordinate", function() {

		it("can be created with an element and relative offsets", function() {
			HtmlCoordinate.fromRelativeCoords();
		});

	});

}());