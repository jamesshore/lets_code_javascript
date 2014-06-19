// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var HtmlElement = require("./html_element.js");
	var browser = require("./browser.js");

	describe("Home page", function() {
		if (browser.doesNotComputeStyles()) return;

		it("has a blue background", function() {
			expect(backgroundColorOf(document.body)).to.be("rgb(66, 169, 204)");
		});

		it("centers logo at top of page", function() {
			expect(isElementCenteredInPage("<h1 id='logo' style='width: 200px;'>Hello World</h1>")).to.be(true);
			expect(isTextCentered("<h1 id='logo' style='width: 200px;'>Hello World</h1>")).to.be(true);

			expect(elementPixelsFromTopOfPage("<h1 id='logo' style='width: 200px;'>Hello World</h1>")).to.be(12);
		});

		it("centers tagline directly below logo", function() {
			expect(isTextCentered("<p id='tagline'>Tag line here</p>")).to.be(true);
		});

	});

	function isElementCenteredInPage(html) {
		var element = HtmlElement.fromHtml(html);
		element.appendSelfToBody();
		try {
			var domElement = element.toDomElement();

			var boundingBox = domElement.getBoundingClientRect();
			var elementWidth = boundingBox.width;
			var elementLeft = boundingBox.left;
			var elementRight = boundingBox.right;

			var bodyStyle = window.getComputedStyle(document.body);

			var bodyWidthExcludingMargins = document.body.clientWidth;
			var bodyLeftMarginWidth = pixelsToInt(bodyStyle.getPropertyValue("margin-left"));
			var bodyRightMarginWidth = pixelsToInt(bodyStyle.getPropertyValue("margin-right"));
			var bodyWidth = bodyWidthExcludingMargins + bodyLeftMarginWidth + bodyRightMarginWidth;

			var expectedSides = (bodyWidth - elementWidth) / 2;

			var success = true;
			if (elementLeft !== Math.round(expectedSides)) {
				console.log("expected left to be " + expectedSides + " but was " + elementLeft + " (element is " + elementWidth + "px wide; screen is " + bodyWidth + "px wide)");
				success = false;
			}

			var expectedRight = Math.round(bodyWidth - expectedSides);
			if (elementRight !== expectedRight) {
				console.log("expected right to be " + expectedRight + " but was " + elementRight + " (element is " + elementWidth + "px wide; screen is " + bodyWidth + "px wide)");
				success = false;
			}

			return success;
		}
		finally {
			element.remove();
		}
	}

	function elementPixelsFromTopOfPage(html) {
		var element = HtmlElement.fromHtml(html);
		element.appendSelfToBody();
		try {
			var domElement = element.toDomElement();

			var boundingBox = domElement.getBoundingClientRect();

			return boundingBox.top;
		}
		finally {
			element.remove();
		}
	}

	function backgroundColorOf(domElement) {
		var style = window.getComputedStyle(domElement);
		return style.getPropertyValue("background-color");
	}

	function isTextCentered(html) {
		var element = HtmlElement.fromHtml(html);
		element.appendSelfToBody();
		try {
			var domElement = element.toDomElement();

			var style = window.getComputedStyle(domElement);
			var textAlign = style.getPropertyValue("text-align");

			return textAlign === "center";
		}
		finally {
			element.remove();
		}
	}

	function pixelsToInt(pixels) {
		return parseInt(pixels, 10);
	}

}());
