// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("../../shared/_assert.js");
	var cssHelper = require("./_css_test_helper.js");

	describe("CSS: Button block", function() {

		cssHelper.setupUnitTests();

		var INHERITED_FONT = "inherit-this-font";

		var linkTag;
		var buttonTag;

		beforeEach(function() {
			cssHelper.frame.add(
				"<div style='font-family: " + INHERITED_FONT + "'>" +
				" <a id='a_tag' class='button' href='#createUnderline'>foo</a>" +
				" <button id='button_tag' class='button'>foo</button>" +
				"</div>"
			);

			linkTag = cssHelper.frame.get("#a_tag");
			buttonTag = cssHelper.frame.get("#button_tag");
		});

		it("text", function() {
			assert.equal(cssHelper.textAlign(linkTag), "center", "should be horizontally centered");
			assert.equal(cssHelper.textIsUnderlined(linkTag), false, "text should not be underlined");
			assert.equal(cssHelper.textIsUppercase(linkTag), true, "text should be uppercase");
			assert.equal(cssHelper.fontFamily(buttonTag), INHERITED_FONT, "<button> should inherit container's font");
		});

		it("has no border", function() {
			assert.equal(cssHelper.hasBorder(linkTag), false, "standard link button");
			assert.equal(cssHelper.hasBorder(buttonTag), false, "button tag button");
		});

		it("has no padding or margins", function() {
			assert.equal(cssHelper.margin(buttonTag), "0px", "margin");
			assert.equal(cssHelper.padding(buttonTag), "0px", "padding");
		});

		it("has rounded corners", function() {
			assert.equal(cssHelper.roundedCorners(linkTag), cssHelper.CORNER_ROUNDING);
		});

		it("appear to depress when user activates it", function() {
			cssHelper.assertActivateDepresses(linkTag, 1);
		});

	});

	describe("Action button block variant", function() {

		var linkTag;
		var buttonTag;

		beforeEach(function() {
			linkTag = cssHelper.frame.add("<a class='button button--action' href='#createUnderline'>foo</a>", "<a> button");
			buttonTag = cssHelper.frame.add("<button class='button button--action'>foo</button>", "<button> button");
		});

		it("is big and pressable", function() {
			linkTag.assert({
				height: 35
			});
		});

		it("has large text", function() {
			assert.equal(cssHelper.isTextVerticallyCentered(linkTag), true, "should be vertically centered");
			assert.equal(cssHelper.fontSize(linkTag), "16px", "font size");
			assert.equal(cssHelper.fontWeight(linkTag), cssHelper.LINK_BUTTON_WEIGHT, "button weight");
		});

		it("uses bright colors", function() {
			assert.equal(cssHelper.backgroundColor(linkTag), cssHelper.MEDIUM_BLUE, "background");
			assert.equal(cssHelper.textColor(linkTag), cssHelper.WHITE, "text");
			assert.equal(cssHelper.dropShadow(linkTag), cssHelper.DARK_BLUE + cssHelper.BUTTON_DROP_SHADOW, "drop shadow");
			cssHelper.assertHoverStyle(linkTag, cssHelper.DARKENED_MEDIUM_BLUE, "hover background");
		});

	});


	describe("Drawing button block variant", function() {

		var linkTag;
		var buttonTag;

		beforeEach(function() {
			linkTag = cssHelper.frame.add("<a class='button button--drawing' href='#createUnderline'>foo</a>", "<a> button");
			buttonTag = cssHelper.frame.add("<button class='button button--drawing'>foo</button>", "<button> button");
		});

		it("is a bit smaller", function() {
			linkTag.assert({
				height: 30
			});
		});

		it("has smaller, bolder text", function() {
			assert.equal(cssHelper.fontSize(linkTag), "12px", "font size");
			assert.equal(cssHelper.fontWeight(linkTag), cssHelper.DRAWING_BUTTON_WEIGHT, "font weight");
			assert.equal(cssHelper.isTextVerticallyCentered(linkTag), true, "should be vertically centered");
		});

		it("uses muted colors", function() {
			assert.equal(cssHelper.backgroundColor(linkTag), cssHelper.GRAY, "button background");
			assert.equal(cssHelper.textColor(linkTag), cssHelper.DARK_GRAY, "button text");
			assert.equal(cssHelper.dropShadow(linkTag), cssHelper.MEDIUM_GRAY + cssHelper.BUTTON_DROP_SHADOW, "drop shadow");
			cssHelper.assertHoverStyle(linkTag, cssHelper.DARKENED_GRAY, "hover background");
		});

	});

}());