// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var cssHelper = require("./_css_test_helper.js");

	describe("CSS: Ghost pointer block", function() {

		cssHelper.setupUnitTests();

		var pointer;

		beforeEach(function() {
			pointer = cssHelper.frame.add("<div class='ghost-pointer'>img</div>", "pointer");
		});

		it("is slightly transparent", function() {
			assert.equal(cssHelper.opacity(pointer), "0.5", "opacity");
		});

	});

}());