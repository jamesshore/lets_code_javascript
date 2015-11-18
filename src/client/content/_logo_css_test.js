// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("../../shared/_assert.js");
	var cssHelper = require("./_css_test_helper.js");

	describe("CSS: Logo block", function() {

		cssHelper.setupUnitTests();

		var logo;

		beforeEach(function() {
			logo = cssHelper.frame.add("<div class='logo'>logo</div>", "logo");
		});

		it("is nice and big", function() {
			logo.assert({
				height: 30
			});
		});

		it("text", function() {
			assert.equal(cssHelper.textAlign(logo), "center", "should be horizontally centered");
			assert.equal(cssHelper.isTextVerticallyCentered(logo), true, "should be vertically centered");
			assert.equal(cssHelper.fontSize(logo), "30px", "font size");
			assert.equal(cssHelper.fontWeight(logo), cssHelper.HEADLINE_WEIGHT, "font weight");
		});

		it("color", function() {
			assert.equal(cssHelper.backgroundColor(logo), cssHelper.TRANSPARENT, "background color");
			assert.equal(cssHelper.textColor(logo), cssHelper.WHITE, "text color");
		});

	});


}());