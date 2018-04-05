// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var cssHelper = require("./_css_test_helper.js");
	var quixote = require("./vendor/quixote-0.9.0.js");

	describe("CSS: 404 page", function() {

		var frame;
		var page;
		var viewport;

		var logo;
		var header;
		var tagline;
		var drawSomething;

		before(function(done) {
			/*eslint no-invalid-this:off */
			this.timeout(10 * 1000);
			var options = {
				src: "/base/src/client/content/404.html",
				width: cssHelper.IOS_BROWSER_WIDTH,
				height: cssHelper.IPAD_LANDSCAPE_HEIGHT_WITH_BROWSER_TABS
			};
			frame = quixote.createFrame(options, done);
		});

		after(function() {
			frame.remove();
		});

		beforeEach(function() {
			frame.reset();

			page = frame.page();
			viewport = frame.viewport();

			logo = frame.get("#logo");
			header = frame.get("#header");
			tagline = frame.get("#tagline");
			drawSomething = frame.get("#draw-something");
		});

		it("fits perfectly within viewport", function() {
			page.assert({
				width: viewport.width,
				height: viewport.height
			}, "page should not be larger than viewport");
		});

		it("has a nice margin when viewport is smaller than the page", function() {
			frame.resize(50, 50);

			drawSomething.assert({
				bottom: page.bottom.minus(13)
			}, "bottom element should have a nice margin before the bottom of the page");
		});

		it("has an overall layout", function() {
			logo.assert({
				top: logo.height.times(2),
				center: page.center,
				height: 30
			}, "logo should be centered at top of page");
			assert.equal(cssHelper.fontSize(logo), "30px", "logo font size");
			assert.equal(cssHelper.textAlign(logo), "center", "logo text should be centered");
			header.assert({
				top: logo.bottom,
				center: viewport.center,
				height: 200
			}, "404 header should be centered under logo");
			assert.equal(cssHelper.fontSize(header), "200px", "header font size");
			assert.equal(cssHelper.textAlign(header), "center", "header text should be centered");
			tagline.assert({
				top: header.bottom.plus(tagline.height),
				center: viewport.center,
				height: 18
			}, "tagline should be centered under 404 header");
			assert.equal(cssHelper.fontSize(tagline), "15px", "tagline font size");
			assert.equal(cssHelper.textAlign(tagline), "center", "tagline text should be centered");
			drawSomething.assert({
				top: tagline.bottom.plus(tagline.height),
				center: page.center,
				height: 35,
				width: 225
			}, "button should be centered below tagline");
			assert.equal(cssHelper.textAlign(drawSomething), "center", "button text should be centered");
		});

		it("has a color scheme", function() {
			assert.equal(cssHelper.backgroundColor(frame.body()), cssHelper.BACKGROUND_BLUE, "page background should be light blue");
			assert.equal(cssHelper.textColor(logo), cssHelper.WHITE, "logo text should be white");
			assert.equal(cssHelper.textColor(header), cssHelper.DARK_BLUE, "header should be dark blue");
			assert.equal(cssHelper.textColor(tagline), cssHelper.DARK_BLUE, "tagline should be dark blue");
			assert.equal(cssHelper.backgroundColor(drawSomething), cssHelper.MEDIUM_BLUE, "button background should be medium blue");
			assert.equal(cssHelper.textColor(drawSomething), cssHelper.WHITE, "button text should be white");
		});

		it("has a typographic scheme", function() {
			assert.equal(cssHelper.fontFamily(logo), cssHelper.STANDARD_FONT, "logo font");
			assert.equal(cssHelper.fontWeight(logo), cssHelper.HEADLINE_WEIGHT, "logo weight");
			assert.equal(cssHelper.fontFamily(header), cssHelper.STANDARD_FONT, "header font");
			assert.equal(cssHelper.fontWeight(header), cssHelper.HEADLINE_WEIGHT, "header weight");
			assert.equal(cssHelper.fontFamily(tagline), cssHelper.STANDARD_FONT, "tagline font");
			assert.equal(cssHelper.fontWeight(tagline), cssHelper.BODY_TEXT_WEIGHT, "tagline weight");
			assert.equal(cssHelper.fontFamily(drawSomething), cssHelper.STANDARD_FONT, "draw something button family");
			assert.equal(cssHelper.fontWeight(drawSomething), cssHelper.LINK_BUTTON_WEIGHT, "draw something button weight");
		});


		describe("button", function() {

			it("has common styling", function() {
				assertStandardButtonStyling(drawSomething, "draw something button");
			});

			it("has rounded corners", function() {
				assert.equal(cssHelper.roundedCorners(drawSomething), cssHelper.CORNER_ROUNDING, "draw something button");
			});

			it("has a drop shadow", function() {
				assert.equal(cssHelper.dropShadow(drawSomething), cssHelper.DARK_BLUE + cssHelper.BUTTON_DROP_SHADOW, "draw something button drop shadow");
			});

			it("darkens when user hovers over them", function() {
				cssHelper.assertHoverStyle(drawSomething, cssHelper.DARKENED_MEDIUM_BLUE, "draw something button");
			});

			it("appears to depress when user activates them", function() {
				cssHelper.assertActivateDepresses(drawSomething, tagline.bottom.plus(19), "draw something button");
			});

		});
	});


	function assertStandardButtonStyling(button, description) {
		assert.equal(cssHelper.textAlign(button), "center", description + "text horizontal centering");
		assert.equal(cssHelper.isTextVerticallyCentered(button), true, description + " text vertical centering");
		assert.equal(cssHelper.textIsUnderlined(button), false, description + " text underline");
		assert.equal(cssHelper.textIsUppercase(button), true, description + " text uppercase");
		assert.equal(cssHelper.hasBorder(button), false, description + " border");
	}

}());
