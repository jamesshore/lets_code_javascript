// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var HtmlElement = require("./html_element.js");
	var browser = require("./browser.js");
	var failFast = require("./fail_fast.js");

	describe("Home page", function() {
		if (browser.doesNotComputeStyles()) return;

		var WHITE = "rgb(255, 255, 255)";
		var DARK_GRAY = "rgb(89, 89, 89)";
		var GRAY = "rgb(229, 229, 229)";
		var DARKENED_GRAY = "rgb(217, 217, 217)";
		var MEDIUM_GRAY = "rgb(167, 169, 171)";

		var BACKGROUND_BLUE = "rgb(65, 169, 204)";
		var DARK_BLUE = "rgb(13, 87, 109)";
		var MEDIUM_BLUE = "rgb(0, 121, 156)";
		var DARKENED_MEDIUM_BLUE = "rgb(0, 111, 143)";

		var IOS_BROWSER_WIDTH = 980;
		var CORNER_ROUNDING = "2px";
		var BUTTON_DROP_SHADOW = " 0px 1px 0px 0px";

		var frame;
		var frameDom;

		var logo;
		var tagline;
		var drawingAreaArrow;
		var drawingArea;
		var clearButton;
		var footer;
		var joinUs;

		before(function(done) {
			frame = HtmlElement.fromHtml("<iframe width='1200px' height='1000px' src='/base/src/client/index.html'></iframe>");
			frameDom = frame.toDomElement();
			frameDom.addEventListener("load", function() {
				logo = getElement("logo");
				tagline = getElement("tagline");
				drawingAreaArrow = getElement("drawing-area-arrow");
				drawingArea = getElement("drawing-area");
				clearButton = getElement("clear-button");
				footer = getElement("footer");
				joinUs = getElement("join-us");

				done();
			});
			frame.appendSelfToBody();
		});

		after(function() {
			frame.remove();
		});

		function getElement(id) {
			return frameDom.contentDocument.getElementById(id);
		}

		it("has a blue background", function() {
			expect(backgroundColorOf(frameDom.contentDocument.body)).to.be(BACKGROUND_BLUE);
		});

		it("centers logo at top of page", function() {
			expect(isContentCenteredInPage(logo)).to.be(true);
			expect(elementPixelsFromTopOfPage(logo)).to.be(12);
			expect(fontSizeOf(logo)).to.be("22px");
			expect(textColorOf(logo)).to.be(WHITE);
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
			expect(textColorOf(tagline)).to.be(DARK_BLUE);
		});

		it("centers drawing area below tagline", function() {
			expect(isElementCenteredInPage(drawingArea)).to.be(true);
			expect(elementPixelsBelowElement(drawingArea, tagline)).to.be(10);

			expect(elementWidthInPixels(drawingArea)).to.equal(IOS_BROWSER_WIDTH);
			expect(elementHeightInPixels(drawingArea)).to.equal(600);
			expect(backgroundColorOf(drawingArea)).to.equal(WHITE);
			expect(roundedCornersOf(drawingArea)).to.be(CORNER_ROUNDING);
		});

		it("centers an arrow at top of drawing area", function() {
			expect(isElementCenteredInPage(drawingAreaArrow)).to.be(true);

			expect(elementPixelsOverlappingTopOfElement(drawingAreaArrow, drawingArea)).to.be(0);
			// TODO: haven't tested background image, position, or repeat

			expect(isElementBehindElement(drawingAreaArrow, drawingArea)).to.be(false);
		});

		it("positions clear screen button at top right of drawing area", function() {
			expect(elementPixelsOverlappingTopOfElement(clearButton, drawingArea)).to.be(15);
			expect(elementPixelsOverlappingRightOfElement(clearButton, drawingArea)).to.be(15);
			expect(isElementBehindElement(clearButton, drawingArea)).to.be(false);

			expect(textColorOf(clearButton)).to.be(DARK_GRAY);
			expect(backgroundColorOf(clearButton)).to.be(GRAY);
			expect(hasBorder(clearButton)).to.be(false);

			expect(elementHeightInPixels(clearButton)).to.equal(30);
			expect(elementWidthInPixels(clearButton)).to.equal(70);
			expect(isTextVerticallyCentered(clearButton)).to.be(true);

			expect(roundedCornersOf(clearButton)).to.be(CORNER_ROUNDING);
			expect(dropShadowOf(clearButton)).to.be(MEDIUM_GRAY + BUTTON_DROP_SHADOW);

			expect(textIsUnderlined(clearButton)).to.be(false);
			expect(textIsUppercase(clearButton)).to.be(true);
		});

		it("darkens the 'clear' button when the user hovers over it", function() {
			applyClass(clearButton, "_hover_", function() {
				expect(backgroundColorOf(clearButton)).to.be(DARKENED_GRAY);
			});
		});

		it("'clear' button appears to depress when user activates it", function() {
			applyClass(clearButton, "_active_", function() {
				expect(elementPixelsOverlappingTopOfElement(clearButton, drawingArea)).to.be(16);
				expect(dropShadowOf(clearButton)).to.be("none");
			});
		});

		it("centers footer below the drawing area", function() {
			expect(isContentCenteredInPage(footer)).to.be(true);
			expect(elementPixelsBelowElement(footer, drawingArea)).to.be(13);

			expect(fontSizeOf(footer)).to.be("15px");
			expect(textColorOf(footer)).to.be(WHITE);
		});

		it("centers 'join us' button below footer", function() {
			expect(isContentCenteredInPage(joinUs)).to.be(true);
			expect(elementPixelsBelowElement(joinUs, footer)).to.be(13);

			expect(textColorOf(joinUs)).to.be(WHITE);
			expect(backgroundColorOf(joinUs)).to.be(MEDIUM_BLUE);

			expect(elementHeightInPixels(joinUs)).to.equal(35);
			expect(elementWidthInPixels(joinUs)).to.equal(175);
			expect(isTextVerticallyCentered(joinUs)).to.be(true);

			expect(roundedCornersOf(joinUs)).to.be(CORNER_ROUNDING);
			expect(dropShadowOf(joinUs)).to.be(DARK_BLUE + BUTTON_DROP_SHADOW);

			expect(textIsUnderlined(joinUs)).to.be(false);
			expect(textIsUppercase(joinUs)).to.be(true);
		});

		it("darkens the 'join us' button when the user hovers over it", function() {
			applyClass(joinUs, "_hover_", function() {
				expect(backgroundColorOf(joinUs)).to.be(DARKENED_MEDIUM_BLUE);
			});
		});

		it("'join us' button appears to depress when user activates it", function() {
			applyClass(joinUs, "_active_", function() {
				expect(elementPixelsBelowElement(joinUs, footer)).to.be(14);
				expect(dropShadowOf(joinUs)).to.be("none");
			});
		});

		function isContentCenteredInPage(domElement) {
			if (!isElementCenteredInPage(domElement)) return false;

			var style = window.getComputedStyle(domElement);
			var textAlign = style.getPropertyValue("text-align");

			return textAlign === "center";
		}

		function isElementCenteredInPage(domElement) {
			var frameBody = frameDom.contentDocument.body;

			var bodyStyle = frameDom.contentWindow.getComputedStyle(frameBody);
			var bodyLeftMarginWidth = pixelsToInt(bodyStyle.getPropertyValue("margin-left"));
			var bodyRightMarginWidth = pixelsToInt(bodyStyle.getPropertyValue("margin-right"));

			// We can't just base the document width on the frame width because that doesn't account for scroll bars.
			var bodyBoundingBox = frameBody.getBoundingClientRect();
			var documentLeft = bodyBoundingBox.left - bodyLeftMarginWidth;
			var documentRight = bodyBoundingBox.right + bodyRightMarginWidth;

			var elementBoundingBox = getBoundingBox(domElement);
			var elementLeft = elementBoundingBox.left;
			var elementRight = elementBoundingBox.right;

			var documentCenter = (documentRight - documentLeft) / 2;
			var elementCenter = elementLeft + ((elementRight - elementLeft) / 2);

//			console.log("*** CENTER: element width", elementBoundingBox.width);
//			console.log("documentLeft", documentLeft);
//			console.log("documentRight", documentRight);
//			console.log("elementLeft", elementLeft);
//			console.log("elementRight", elementRight);
//			console.log("documentCenter", documentCenter);
//			console.log("elementCenter", elementCenter);

			var offset = Math.abs(documentCenter - elementCenter);
			var success = (offset <= 0.5);

//			console.log(success ? "✔ SUCCESS" : "✘ FAILURE");

			return success;
		}

		function elementPixelsFromTopOfPage(domElement) {
			return getBoundingBox(domElement).top;
		}

		function elementHeightInPixels(domElement) {
			return getBoundingBox(domElement).height;
		}

		function elementWidthInPixels(domElement) {
			return getBoundingBox(domElement).width;
		}

		function elementPixelsBelowElement(domElement, domRelativeToElement) {
			return Math.round(getBoundingBox(domElement).top - getBoundingBox(domRelativeToElement).bottom);
		}

		function elementPixelsOverlappingTopOfElement(domElement, domRelativeToElement) {
			return Math.round(getBoundingBox(domElement).top - getBoundingBox(domRelativeToElement).top);
		}

		function elementPixelsOverlappingRightOfElement(domElement, domRelativeToElement) {
			return Math.round(getBoundingBox(domRelativeToElement).right - getBoundingBox(domElement).right);
		}

		function isElementBehindElement(domElement, domRelativeToElement) {
			var elementZ = getZIndex(domElement);
			var relativeZ = getZIndex(domRelativeToElement);

			if (elementZ === relativeZ) return !isElementAfterElementInDomTree();
			else return (elementZ < relativeZ);

			function getZIndex(domElement) {
				var z = getComputedProperty(domElement, "z-index");
				if (z === "auto") z = 0;
				return z;
			}

			function isElementAfterElementInDomTree() {
				var elementNode = domElement;
				var relativeNode = domRelativeToElement;
				var foundRelative = false;
				var elementAfterRelative = false;
				for (var child = elementNode.parentNode.firstChild; child !== null; child = child.nextSibling) {
					if (child === elementNode) {
						if (foundRelative) elementAfterRelative = true;
					}
					if (child === relativeNode) foundRelative = true;
				}
				failFast.unlessTrue(foundRelative, "can't yet compare elements that have same z-index and are not siblings");
				return elementAfterRelative;
			}
		}

		function isTextVerticallyCentered(domElement) {
			var elementHeight = getBoundingBox(domElement).height;
			var lineHeight = getComputedProperty(domElement, "line-height");

			return elementHeight + "px" === lineHeight;
		}

		function backgroundColorOf(domElement) {
			return getComputedProperty(domElement, "background-color");
		}

		function fontSizeOf(domElement) {
			return getComputedProperty(domElement, "font-size");
		}

		function textColorOf(domElement) {
			return getComputedProperty(domElement, "color");
		}

		function hasBorder(domElement) {
			var top = getComputedProperty(domElement, "border-top-style");
			var right = getComputedProperty(domElement, "border-right-style");
			var bottom = getComputedProperty(domElement, "border-bottom-style");
			var left = getComputedProperty(domElement, "border-left-style");
			return !(top === "none" && right === "none" && bottom === "none" && left === "none");
		}

		function textIsUnderlined(domElement) {
			var style = getComputedProperty(domElement, "text-decoration");
			return style.indexOf("none") !== 0;
		}

		function textIsUppercase(domElement) {
			return getComputedProperty(domElement, "text-transform") === "uppercase";
		}

		function roundedCornersOf(domElement) {
			// We can't just look at border-radius because it returns "" on Firefox and IE 9
			var topLeft = getComputedProperty(domElement, "border-top-left-radius");
			var topRight = getComputedProperty(domElement, "border-top-right-radius");
			var bottomLeft = getComputedProperty(domElement, "border-bottom-left-radius");
			var bottomRight = getComputedProperty(domElement, "border-bottom-right-radius");

			if (topLeft === topRight && topLeft === bottomLeft && topLeft === bottomRight) return topLeft;
			else return topLeft + " " + topRight + " " + bottomRight + " " + bottomLeft;
		}

		function dropShadowOf(domElement) {
			var shadow = getComputedProperty(domElement, "box-shadow");

			// When there is no drop shadow, most browsers say 'none', but IE 9 gives a color and nothing else.
			// We handle that case here.
			if (shadow === "white") return "none";
			if (shadow.match(/^#[0-9a-f]{6}$/)) return "none";      // look for '#' followed by six hex digits

			// The standard value seems to be "rgb(r, g, b) Wpx Xpx Ypx Zpx",
			// but IE 9 gives us "Wpx Xpx Ypx Zpx #rrggbb". We need to normalize it.
			// BTW, we don't support multiple shadows yet
			var groups = shadow.match(/^([^#]+) #(..)(..)(..)/);   // get everything before the '#' and the r, g, b
			if (groups === null) return shadow;   // There was no '#', so we assume we're not on IE 9 and everything's fine

			var sizes = groups[1];
			var r = parseInt(groups[2], 16);
			var g = parseInt(groups[3], 16);
			var b = parseInt(groups[4], 16);
			return "rgb(" + r + ", " + g + ", " + b + ") " + sizes;
		}

		function getBoundingBox(domElement) {
			return domElement.getBoundingClientRect();
		}

		function getComputedProperty(domElement, propertyName) {
			var style = window.getComputedStyle(domElement);
			return style.getPropertyValue(propertyName);
		}

		function applyClass(domElement, className, fn) {
			var oldClassName = domElement.className;
			try {
				domElement.className += className;
				forceReflow(domElement);

				fn();
			}
			finally {
				domElement.className = oldClassName;
				forceReflow(domElement);
			}
		}

		function forceReflow(domElement) {
			var makeLintHappy = domElement.offsetHeight;
		}

		function pixelsToInt(pixels) {
			return parseInt(pixels, 10);
		}

	});

}());
