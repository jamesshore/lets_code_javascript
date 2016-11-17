// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var cssHelper = require("./_css_test_helper.js");

	describe("CSS: Layout", function() {

		cssHelper.setupUnitTests();


		describe("Full width", function() {

			var element;

			beforeEach(function() {
				element = cssHelper.frame.add("<div class='layout-width-full'></div>", "element");
			});

			it("is the width of the iPad", function() {
				element.assert({
					width: cssHelper.IOS_BROWSER_WIDTH
				});
			});

		});


		describe("Button width", function() {

			var element;

			beforeEach(function() {
				element = cssHelper.frame.add("<div class='layout-width-button'></div>", "element");
			});

			it("is actually a bit more than 1/4 of full width", function() {
				element.assert({
					width: 225
				});
			});

		});


		describe("Center", function() {

			var container;
			var element;

			beforeEach(function() {
				container = cssHelper.frame.add(
					"<div style='width: 200px'>" +
					" <span id='layout' class='layout-center'>lay out this span</span>" +
					"</div>", "container"
				);
				element = cssHelper.frame.get("#layout");
			});

			it("is centered in its container", function() {
				element.assert({
					center: container.center
				});
			});

		});


		describe("Text center", function() {

			var element;

			beforeEach(function() {
				element = cssHelper.frame.add("<div class='layout-center-text'>text</div>", element);
			});

			it("has centered text", function() {
				assert.equal(cssHelper.textAlign(element), "center");
			});

		});

	});

}());