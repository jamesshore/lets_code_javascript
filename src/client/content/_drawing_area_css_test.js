// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var cssHelper = require("./_css_test_helper.js");

	describe("CSS: Drawing area block", function() {

		cssHelper.setupUnitTests();

		var drawingArea;
		var arrow;
		var canvas;
		var button;

		beforeEach(function() {
			cssHelper.frame.add("<div style='height: 100px;'>spacer</div>");    // force positioning tests to be meaningful
			drawingArea = cssHelper.frame.add("" +
				"<div class='drawing-area'>" +
				" <div id='drawing-area-canvas' class='drawing-area__canvas'></div>" +
				" <div id='arrow' class='drawing-area__arrow'></div>" +
				" <div id='button' class='drawing-area__button button'></div>" +
				"</div>", "drawing area");
			canvas = cssHelper.frame.get("#drawing-area-canvas");
			arrow = cssHelper.frame.get("#arrow");
			button = cssHelper.frame.get("#button");
		});

		describe("canvas", function() {

			it("completely fills its container", function() {
				canvas.assert({
					top: drawingArea.top,
					right: drawingArea.right,
					bottom: drawingArea.bottom,
					left: drawingArea.left
				});
			});

			it("has a fixed height", function() {
				canvas.assert({
					height: 474
				});
			});

			it("has rounded corners", function() {
				assert.equal(cssHelper.roundedCorners(canvas), cssHelper.CORNER_ROUNDING);
			});

			it("has a white background", function() {
				assert.equal(cssHelper.backgroundColor(canvas), cssHelper.WHITE);
			});

		});

		describe("arrow", function() {

			it("is centered at the top of the drawing area, overlapping the canvas", function() {
				arrow.assert({
					center: drawingArea.center,
					top: drawingArea.top
				});
			});

			it("is over canvas", function() {
				assert.equal(cssHelper.under(arrow, canvas), false);
			});

			it("has an arrow image", function() {
				arrow.assert({
					height: 9
				}, "arrow should be same height as arrow gif");

				assert.equal(cssHelper.backgroundImage(arrow), "/images/arrow.png", "arrow should be an image");
				assert.equal(arrow.getRawStyle("background-repeat"), "no-repeat", "arrow should be drawn once");
				assert.equal(cssHelper.backgroundPosition(arrow), "center", "arrow image is centered");
			});

		});

		describe("button", function() {

			it("is positioned at the top-right of the drawing area, overlapping the canvas", function() {
				button.assert({
					top: drawingArea.top.plus(15),
					right: drawingArea.right.minus(15)
				});
			});

			it("has a hardcoded width", function() {
				button.assert({
					width: 70
				});
			});

			it("positioning does not conflict with the standard button block activation", function() {
				cssHelper.assertActivateDepresses(button, drawingArea.top.plus(16));
			});

		});

	});

}());