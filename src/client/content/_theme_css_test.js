// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var cssHelper = require("./_css_test_helper.js");
	var assert = require("../../shared/_assert.js");

	describe("CSS: 'Let's Code' theme", function() {

		cssHelper.setupUnitTests();

		var page;
		var theme;
		var p;
		var strong;

		beforeEach(function() {
			page = cssHelper.frame.page();
			theme = cssHelper.frame.add(
				"<div class='theme-lets-code'>" +
				" <p id='p'>normal paragraph</p>" +
				" <p><strong id='strong'>strong paragraph</strong></p>" +
				"</div>", "theme");

			p = cssHelper.frame.get("#p");
			strong = cssHelper.frame.get("#strong");
		});

		it("text", function() {
			assert.equal(cssHelper.fontFamily(theme), cssHelper.STANDARD_FONT, "font family");
		});

		it("colors", function() {
			assert.equal(cssHelper.backgroundColor(theme), cssHelper.BACKGROUND_BLUE, "background color");
		});

		it("normal paragraphs", function() {
			assert.equal(cssHelper.fontSize(p), "15px", "font size");
			assert.equal(cssHelper.fontWeight(p), cssHelper.BODY_TEXT_WEIGHT, "font weight");
			assert.equal(cssHelper.lineHeight(p), "18px", "line height");
			assert.equal(cssHelper.backgroundColor(p), cssHelper.TRANSPARENT, "background color");
			assert.equal(cssHelper.textColor(p), cssHelper.DARK_BLUE, "text color");
		});

		it("strong paragraphs", function() {
			assert.equal(cssHelper.fontSize(strong), "15px", "font size");
			assert.equal(cssHelper.fontWeight(strong), cssHelper.BODY_TEXT_WEIGHT, "font weight");
			assert.equal(cssHelper.textColor(strong), cssHelper.WHITE, "text color");
		});

	});

}());