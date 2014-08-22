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
		var mediumBlue = "rgb(0, 111, 143)";

		var logo;
		var tagline;
		var drawingAreaContainer;
		var drawingAreaArrow;
		var drawingArea;
		var clearButton;
		var footer;
		var joinUs;

		beforeEach(function() {
			logo = newElement("<h1 id='logo'>Hello World</h1>");
			tagline = newElement("<p id='tagline'>Tag line here</p>");
			drawingAreaContainer = newElement("" +
				"<div id='drawingAreaContainer'>" +
				" <div id='drawingAreaArrow'>v</div>" +
				" <button id='clearButton' type='button'>Clear</button>" +
				" <div id='drawingArea'></div>" +
				"</div>"
			);
			footer = newElement("<p id='footer'>Footer here</p>");
			joinUs = newElement("<a id='joinUs' href='#'>Join Us!</a></div>");

			drawingAreaArrow = HtmlElement.fromId("drawingAreaArrow");
			drawingArea = HtmlElement.fromId("drawingArea");
			clearButton = HtmlElement.fromId("clearButton");
		});

		afterEach(function() {
			logo.remove();
			tagline.remove();
			drawingAreaContainer.remove();
			footer.remove();
			joinUs.remove();
		});

		function newElement(html) {
			var element = HtmlElement.fromHtml(html);
			element.appendSelfToBody();
			return element;
		}

		it("has a blue background", function() {
			expect(backgroundColorOf(new HtmlElement(document.body))).to.be(backgroundBlue);
		});

		it("centers logo at top of page", function() {
			expect(isContentCenteredInPage(logo)).to.be(true);
			expect(elementPixelsFromTopOfPage(logo)).to.be(12);
			expect(fontSizeOf(logo)).to.be("22px");
			expect(textColorOf(logo)).to.be(white);
		});

//		it("create iOS Safari failure", function() {
//			newElement('<div><p id="tagline">tagline</p><p id="footer">footer</p></div>');
//
//
//			var domElement = document.getElementById("tagline");
//			var boundingBox = domElement.getBoundingClientRect();     // comment this line out to make test pass
//
//
//			var style = window.getComputedStyle(domElement);
//			var fontSize = style.getPropertyValue("font-size");
//
//			expect(fontSize).to.be("14px");
//		});

		it("centers tagline directly below logo", function() {
			expect(isContentCenteredInPage(tagline)).to.be(true);
			expect(elementPixelsBelowElement(tagline, logo)).to.be(5);

			expect(fontSizeOf(tagline)).to.be("14px");
			expect(textColorOf(tagline)).to.be(darkBlue);
		});

		it("centers drawing area below tagline", function() {
			expect(isElementCenteredInPage(drawingArea)).to.be(true);
			expect(elementPixelsBelowElement(drawingArea, tagline)).to.be(10);

			expect(elementHeightInPixels(drawingArea)).to.equal(600);
			expect(backgroundColorOf(drawingArea)).to.equal(white);
		});

		it("centers arrow at top of drawing area", function() {
			expect(isElementCenteredInPage(drawingAreaArrow)).to.be(true);

			expect(elementPixelsOverlappingTopOfElement(drawingAreaArrow, drawingArea)).to.be(0);
			// TODO: haven't tested background image, position, or repeat
		});

		it("positions clear screen button at top right of drawing area", function() {
			expect(elementPixelsOverlappingTopOfElement(clearButton, drawingArea)).to.be(15);
			expect(elementPixelsOverlappingRightOfElement(clearButton, drawingArea)).to.be(15);
		});

		it("centers footer below the drawing area", function() {
			expect(isContentCenteredInPage(footer)).to.be(true);
			expect(elementPixelsBelowElement(footer, drawingArea)).to.be(13);

			expect(fontSizeOf(footer)).to.be("15px");
			expect(textColorOf(footer)).to.be(white);
		});

		it.only("centers 'join us' button below footer", function() {
			expect(isContentCenteredInPage(joinUs)).to.be(true);
			expect(elementPixelsBelowElement(joinUs, footer)).to.be(13);

			expect(textColorOf(joinUs)).to.be(white);
			expect(backgroundColorOf(joinUs)).to.be(mediumBlue);

			expect(elementHeightInPixels(joinUs)).to.equal(35);
			expect(elementWidthInPixels(joinUs)).to.equal(175);
		});


	});

	function isElementCenteredInPage(element) {
		// Calculate document bounding box. We could have used
		//   document.documentElement.getBoundingClientRect();
		// but IE9 returns an empty object for documentElement.
		// (getBoundingClientRect() does work in IE9 for regular elements, just not on documentElement.)
		var bodyStyle = window.getComputedStyle(document.body);
		var bodyWidthExcludingMargins = document.body.clientWidth;
		var bodyLeftMarginWidth = pixelsToInt(bodyStyle.getPropertyValue("margin-left"));
		var bodyRightMarginWidth = pixelsToInt(bodyStyle.getPropertyValue("margin-right"));
		var documentLeft = 0;
		var documentRight = bodyWidthExcludingMargins + bodyLeftMarginWidth + bodyRightMarginWidth;

		var elementBoundingBox = getBoundingBox(element);
		var elementLeft = elementBoundingBox.left;
		var elementRight = elementBoundingBox.right;

		var documentCenter = (documentRight - documentLeft) / 2;
		var elementCenter = elementLeft + ((elementRight - elementLeft) / 2);

//		console.log("*** CENTER: element width", elementBoundingBox.width);
//		console.log("documentLeft", documentLeft);
//		console.log("documentRight", documentRight);
//		console.log("elementLeft", elementLeft);
//		console.log("elementRight", elementRight);
//		console.log("documentCenter", documentCenter);
//		console.log("elementCenter", elementCenter);

		var offset = Math.abs(documentCenter - elementCenter);
		var success = (offset <= 0.5);
//		console.log(success ? "✔ SUCCESS" : "✘ FAILURE");

		return success;
	}

	function elementPixelsFromTopOfPage(element) {
		return getBoundingBox(element).top;
	}

	function elementHeightInPixels(element) {
		return getBoundingBox(element).height;
	}

	function elementWidthInPixels(element) {
		return getBoundingBox(element).width;
	}

	function elementPixelsBelowElement(element, relativeToElement) {
		return Math.round(getBoundingBox(element).top - getBoundingBox(relativeToElement).bottom);
	}

	function elementPixelsOverlappingTopOfElement(element, relativeToElement) {
		return getBoundingBox(element).top - getBoundingBox(relativeToElement).top;
	}

	function elementPixelsOverlappingRightOfElement(element, relativeToElement) {
		return getBoundingBox(relativeToElement).right - getBoundingBox(element).right;
	}

	function backgroundColorOf(element) {
		return getComputedProperty(element.toDomElement(), "background-color");
	}

	function fontSizeOf(element) {
		return getComputedProperty(element.toDomElement(), "font-size");
	}

	function textColorOf(element) {
		return getComputedProperty(element.toDomElement(), "color");
	}

	function isContentCenteredInPage(element) {
		if (!isElementCenteredInPage(element)) return false;

		var domElement = element.toDomElement();

		var style = window.getComputedStyle(domElement);
		var textAlign = style.getPropertyValue("text-align");

		return textAlign === "center";
	}

	function getBoundingBox(element) {
		var domElement = element.toDomElement();
		return domElement.getBoundingClientRect();
	}

	function getComputedProperty(domElement, propertyName) {
		var style = window.getComputedStyle(domElement);
		return style.getPropertyValue(propertyName);
	}

	function pixelsToInt(pixels) {
		return parseInt(pixels, 10);
	}

}());
