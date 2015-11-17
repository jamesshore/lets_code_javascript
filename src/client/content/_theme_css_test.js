// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var cssInfo = require("./_css_info.js");
	var assert = require("../../shared/_assert.js");

	describe("CSS: 'Let's Code' theme", function() {

		cssInfo.setupUnitTests();

		var page;
		var theme;
		var p;
		var strong;

		beforeEach(function() {
			page = cssInfo.frame.page();
			theme = cssInfo.frame.add(
				"<div class='theme-lets-code'>" +
				" <p id='p'>normal paragraph</p>" +
				" <p><strong id='strong'>strong paragraph</strong></p>" +
				"</div>", "theme");

			p = cssInfo.frame.get("#p");
			strong = cssInfo.frame.get("#strong");
		});

		it("text", function() {
			assert.equal(cssInfo.fontFamily(theme), cssInfo.STANDARD_FONT, "font family");
		});

		it("colors", function() {
			assert.equal(cssInfo.backgroundColor(theme), cssInfo.BACKGROUND_BLUE, "background color");
		});

		it("normal paragraphs", function() {
			assert.equal(cssInfo.fontSize(p), "15px", "font size");
			assert.equal(cssInfo.fontWeight(p), cssInfo.BODY_TEXT_WEIGHT, "font weight");
			assert.equal(cssInfo.lineHeight(p), "18px", "line height");
			assert.equal(cssInfo.backgroundColor(p), cssInfo.TRANSPARENT, "background color");
			assert.equal(cssInfo.textColor(p), cssInfo.DARK_BLUE, "text color");
		});

		it("strong paragraphs", function() {
			assert.equal(cssInfo.fontSize(strong), "15px", "font size");
			assert.equal(cssInfo.fontWeight(strong), cssInfo.BODY_TEXT_WEIGHT, "font weight");
			assert.equal(cssInfo.textColor(strong), cssInfo.WHITE, "text color");
		});

	});

}());