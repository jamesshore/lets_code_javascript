// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var HtmlElement = require("./html_element.js");
	var browser = require("./browser.js");

	describe("Home page", function() {
		if (browser.doesNotComputeStyles()) return;

		var white = "rgb(255, 255, 255)";
		var backgroundBlue = "rgb(66, 169, 204)";
		var darkBlue = "rgb(13, 87, 109)";

		var logo;
		var tagline;
		var drawingArea;

		beforeEach(function() {
			logo = newElement("<h1 id='logo'>Hello World</h1>");
			tagline = newElement("<p id='tagline'>Tag line here</p>");
			drawingArea = newElement("<div id='drawingArea'></div>");
		});

		afterEach(function() {
			logo.remove();
			tagline.remove();
			drawingArea.remove();
		});

		function newElement(html) {
			var element = HtmlElement.fromHtml(html);
			element.appendSelfToBody();
			return element;
		}

		it("has a blue background", function() {
			expect(backgroundColorOf(document.body)).to.be(backgroundBlue);
		});

		it("centers logo at top of page", function() {
			expect(isTextCenteredInPage(logo)).to.be(true);
			expect(elementPixelsFromTopOfPage(logo)).to.be(12);
			expect(fontSizeOf(logo)).to.be("22px");
			expect(textColorOf(logo)).to.be(white);
		});

		it("centers tagline directly below logo", function() {
			expect(isTextCenteredInPage(tagline)).to.be(true);
			expect(elementPixelsBelowElement(tagline, logo)).to.be(5);

			expect(fontSizeOf(tagline)).to.be("14px");
			expect(textColorOf(tagline)).to.be(darkBlue);
		});

		it("centers drawing area below tagline", function() {
			expect(isElementCenteredInPage(drawingArea)).to.be(true);
			expect(elementHeightInPixels(drawingArea)).to.equal(600);
		});

	});

	function isElementCenteredInPage(element) {
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

	function elementPixelsFromTopOfPage(element) {
		var domElement = element.toDomElement();

		var boundingBox = domElement.getBoundingClientRect();

		return boundingBox.top;
	}

	function elementHeightInPixels(element) {
		var domElement = element.toDomElement();
		var boundingBox = domElement.getBoundingClientRect();
		return boundingBox.height;
	}

	function elementPixelsBelowElement(element, relativeToElement) {
		var domElement = element.toDomElement();
		var domRelativeElement = relativeToElement.toDomElement();

		var elementBox = domElement.getBoundingClientRect();
		var relativeBox = domRelativeElement.getBoundingClientRect();

		return elementBox.top - relativeBox.bottom;
	}

	function getComputedProperty(domElement, propertyName) {
		var style = window.getComputedStyle(domElement);
		return style.getPropertyValue(propertyName);
	}

	function backgroundColorOf(domElement) {
		return getComputedProperty(domElement, "background-color");
	}

	function fontSizeOf(element) {
		return getComputedProperty(element.toDomElement(), "font-size");
	}

	function textColorOf(element) {
		return getComputedProperty(element.toDomElement(), "color");
	}

	function isTextCenteredInPage(element) {
		if (!isElementCenteredInPage(element)) return false;

		var domElement = element.toDomElement();

		var style = window.getComputedStyle(domElement);
		var textAlign = style.getPropertyValue("text-align");

		return textAlign === "center";
	}

	function pixelsToInt(pixels) {
		return parseInt(pixels, 10);
	}

}());
