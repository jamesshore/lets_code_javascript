// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var cssHelper = require("./_css_test_helper.js");

	describe("CSS: 'Not found' block", function() {

		cssHelper.setupUnitTests();

		var notFound;

		beforeEach(function() {
			notFound = cssHelper.frame.add("<div class='not-found'>404</div>", "not found");
		});

		it("is very large", function() {
			notFound.assert({
				height: 200
			});
		});

		it("text", function() {
			assert.equal(cssHelper.textAlign(notFound), "center", "should be horizontally centered");
			assert.equal(cssHelper.isTextVerticallyCentered(notFound), true, "should be vertically centered");
			assert.equal(cssHelper.fontSize(notFound), "200px", "font size");
			assert.equal(cssHelper.fontWeight(notFound), cssHelper.HEADLINE_WEIGHT, "font weight");
		});

		it("color", function() {
			assert.equal(cssHelper.backgroundColor(notFound), cssHelper.TRANSPARENT, "background color");
			assert.equal(cssHelper.textColor(notFound), cssHelper.DARK_BLUE, "text color");
		});

	});

}());