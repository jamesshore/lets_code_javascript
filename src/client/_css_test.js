// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var HtmlElement = require("./html_element.js");
	var browser = require("./browser.js");

	describe("CSS", function() {
		if (browser.doesNotComputeStyles()) return;   // TODO: fix me?

		var htmlElement;

		beforeEach(function() {
//			htmlElement = HtmlElement.fromHtml("<h1 style='text-align: center'>Hello World</h1>");
			htmlElement = HtmlElement.fromHtml("<h1 style='margin-left: auto; margin-right: auto; width: 200px;'>Hello World</h1>");
			htmlElement.appendSelfToBody();
		});

		afterEach(function() {
			htmlElement.remove();
		});

		it("headline is centered", function(done) {
//			expect(isTextCentered(htmlElement)).to.be(true);
			expect(isElementCenteredInPage(htmlElement)).to.be(true);

//			setTimeout(done, 5000);
			done();
		});

		it.only("loads css from file", function(done) {
			setTimeout(done, 1500);
		});

	});

	function isTextCentered(element) {
		var domElement = element.toDomElement();

		var style = window.getComputedStyle(domElement);
		var textAlign = style.getPropertyValue("text-align");

		return textAlign === "center";
	}

	function pixelsToInt(pixels) {
		return parseInt(pixels, 10);
	}

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

}());
