// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var browser = require("./browser.js");
	var failFast = require("./fail_fast.js");
	var assert = require("../shared/_assert.js");
	var quixote = require("./vendor/quixote-0.7.1.js");

	var TRANSPARENT = "rgba(0, 0, 0, 0)";
	var WHITE = "rgb(255, 255, 255)";
	var DARK_GRAY = "rgb(89, 89, 89)";
	var GRAY = "rgb(229, 229, 229)";
	var DARKENED_GRAY = "rgb(217, 217, 217)";
	var MEDIUM_GRAY = "rgb(167, 169, 171)";

	var BACKGROUND_BLUE = "rgb(65, 169, 204)";
	var DARK_BLUE = "rgb(13, 87, 109)";
	var MEDIUM_BLUE = "rgb(0, 121, 156)";
	var DARKENED_MEDIUM_BLUE = "rgb(0, 111, 143)";

	var BODY_TEXT_WEIGHT = "300";
	var LINK_BUTTON_WEIGHT = "400";
	var DRAWING_BUTTON_WEIGHT = "600";
	var HEADLINE_WEIGHT = "600";

	var IOS_BROWSER_WIDTH = 980;
	var IPAD_LANDSCAPE_HEIGHT_WITH_BROWSER_TABS = 641;

	var STANDARD_FONT = "alwyn-new-rounded-web, Helvetica, sans-serif";
	var CORNER_ROUNDING = "2px";
	var BUTTON_DROP_SHADOW = " 0px 1px 0px 0px";

	describe("CSS Unit Tests:", function() {

		var frame;

		before(function(done) {
			frame = quixote.createFrame({
				width: 500,
				stylesheet: "/base/src/client/screen.css"
			}, done);
		});

		after(function() {
			frame.remove();
		});

		beforeEach(function() {
			frame.reset();
		});


		describe("'Let's Code' theme", function() {

			var page;
			var theme;
			var p;
			var strong;

			beforeEach(function() {
				page = frame.page();
				theme = frame.add(
					"<div class='theme-lets-code'>" +
					" <p id='p'>normal paragraph</p>" +
					" <p id='strong'><strong>strong paragraph</strong></p>" +
					"</div>", "theme");

				p = frame.get("#p");
				strong = frame.get("#strong");
			});

			it("text", function() {
				assert.equal(fontFamily(theme), STANDARD_FONT, "font family");
				assert.equal(fontWeight(theme), BODY_TEXT_WEIGHT, "font weight");
			});

			it("colors", function() {
				assert.equal(backgroundColor(theme), BACKGROUND_BLUE, "background color");
			});

			it("normal paragraphs", function() {
				assert.equal(fontSize(p), "15px", "font size");
				assert.equal(lineHeight(p), "18px", "line height");
				assert.equal(backgroundColor(p), TRANSPARENT, "background color");
				assert.equal(textColor(p), DARK_BLUE, "text color");
			});

		});


		describe("Button block", function() {

			var INHERITED_FONT = "inherit-this-font";

			var linkTag;
			var buttonTag;

			beforeEach(function() {
				frame.add(
					"<div style='font-family: " + INHERITED_FONT + "'>" +
					" <a id='a_tag' class='button' href='#createUnderline'>foo</a>" +
					" <button id='button_tag' class='button'>foo</button>" +
					"</div>"
				);

				linkTag = frame.get("#a_tag");
				buttonTag = frame.get("#button_tag");
			});

			it("fills its container", function() {
				linkTag.assert({
					width: frame.body().width
				});
				buttonTag.assert({
					width: frame.body().width
				});
			});

			it("text", function() {
				assert.equal(textAlign(linkTag), "center", "should be horizontally centered");
				assert.equal(textIsUnderlined(linkTag), false, "text should not be underlined");
				assert.equal(textIsUppercase(linkTag), true, "text should be uppercase");
				assert.equal(fontFamily(buttonTag), INHERITED_FONT, "<button> should inherit container's font");
			});

			it("has no border", function() {
				assert.equal(hasBorder(linkTag), false, "standard link button");
				assert.equal(hasBorder(buttonTag), false, "button tag button");
			});

			it("has no padding or margins", function() {
				assert.equal(margin(buttonTag), "0px", "margin");
				assert.equal(padding(buttonTag), "0px", "padding");
			});

			it("has rounded corners", function() {
				assert.equal(roundedCorners(linkTag), CORNER_ROUNDING);
			});

			it("appear to depress when user activates it", function() {
				assertActivateDepresses(linkTag, 1);
			});

		});

		describe("Action button block variant", function() {

			var linkTag;
			var buttonTag;

			beforeEach(function() {
				linkTag = frame.add("<a class='button button--action' href='#createUnderline'>foo</a>", "<a> button");
				buttonTag = frame.add("<button class='button button--action'>foo</button>", "<button> button");
			});

			it("is big and pressable", function() {
				linkTag.assert({
					height: 35
				});
			});

			it("has large text", function() {
				assert.equal(isTextVerticallyCentered(linkTag), true, "should be vertically centered");
				assert.equal(fontSize(linkTag), "16px", "font size");
				assert.equal(fontWeight(linkTag), LINK_BUTTON_WEIGHT, "button weight");
			});

			it("uses bright colors", function() {
				assert.equal(backgroundColor(linkTag), MEDIUM_BLUE, "background");
				assert.equal(textColor(linkTag), WHITE, "text");
				assert.equal(dropShadow(linkTag), DARK_BLUE + BUTTON_DROP_SHADOW, "drop shadow");

				assertHoverStyle(linkTag, DARKENED_MEDIUM_BLUE, "hover background");
			});

		});


		describe("Drawing button block variant", function() {

			var linkTag;
			var buttonTag;

			beforeEach(function() {
				linkTag = frame.add("<a class='button button--drawing' href='#createUnderline'>foo</a>", "<a> button");
				buttonTag = frame.add("<button class='button button--drawing'>foo</button>", "<button> button");
			});

			it("is a bit smaller", function() {
				linkTag.assert({
					height: 30
				});
			});

			it("has smaller, bolder text", function() {
				assert.equal(fontSize(linkTag), "12px", "font size");
				assert.equal(fontWeight(linkTag), DRAWING_BUTTON_WEIGHT, "font weight");
				assert.equal(isTextVerticallyCentered(linkTag), true, "should be vertically centered");
			});

			it("uses muted colors", function() {
				assert.equal(backgroundColor(linkTag), GRAY, "button background");
				assert.equal(textColor(linkTag), DARK_GRAY, "button text");
				assert.equal(dropShadow(linkTag), MEDIUM_GRAY + BUTTON_DROP_SHADOW, "drop shadow");

				assertHoverStyle(linkTag, DARKENED_GRAY, "hover background");
			});

		});


		describe("Logo block", function() {

			var logo;

			beforeEach(function() {
				logo = frame.add("<div class='logo'>logo</div>", "logo");
			});

			it("fills its container", function() {
				logo.assert({
					width: frame.body().width
				});
			});

			it("is nice and big", function() {
				logo.assert({
					height: 30
				});
			});

			it("text", function() {
				assert.equal(textAlign(logo), "center", "should be horizontally centered");
				assert.equal(isTextVerticallyCentered(logo), true, "should be vertically centered");
				assert.equal(fontSize(logo), "30px", "font size");
				assert.equal(fontWeight(logo), HEADLINE_WEIGHT, "font weight");
			});

			it("color", function() {
				assert.equal(backgroundColor(logo), TRANSPARENT, "background color");
				assert.equal(textColor(logo), WHITE, "text color");
			});

		});


		describe("'Not found' block", function() {

			var notFound;

			beforeEach(function() {
				notFound = frame.add("<div class='not-found'>404</div>", "not found");
			});

			it("fills its container", function() {
				notFound.assert({
					width: frame.body().width
				});
			});

			it("is very large", function() {
				notFound.assert({
					height: 200
				});
			});

			it("text", function() {
				assert.equal(textAlign(notFound), "center", "should be horizontally centered");
				assert.equal(isTextVerticallyCentered(notFound), true, "should be vertically centered");
				assert.equal(fontSize(notFound), "200px", "font size");
				assert.equal(fontWeight(notFound), HEADLINE_WEIGHT, "font weight");
			});

			it("color", function() {
				assert.equal(backgroundColor(notFound), TRANSPARENT, "background color");
				assert.equal(textColor(notFound), DARK_BLUE, "text color");
			});

		});


		describe("Drawing area block", function() {

			var drawingArea;
			var arrow;
			var canvas;
			var button;

			beforeEach(function() {
				frame.add("<div style='height: 100px;'>spacer</div>");    // force positioning tests to be meaningful
				drawingArea = frame.add("" +
					"<div class='drawing-area'>" +
					" <div id='drawing-area-canvas' class='drawing-area__canvas'></div>" +
					" <div id='arrow' class='drawing-area__arrow'></div>" +
					" <div id='button' class='drawing-area__button button'></div>" +
					"</div>", "drawing area");
				canvas = frame.get("#drawing-area-canvas");
				arrow = frame.get("#arrow");
				button = frame.get("#button");
			});

			it("fills its container", function() {
				drawingArea.assert({
					width: frame.body().width
				});
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
					assert.equal(roundedCorners(canvas), CORNER_ROUNDING);
				});

				it("has a white background", function() {
					assert.equal(backgroundColor(canvas), WHITE);
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
					assert.equal(under(arrow, canvas), false);
				});

				it("has an arrow image", function() {
					arrow.assert({
						height: 9
					}, "arrow should be same height as arrow gif");

					assert.equal(backgroundImage(arrow), "/images/arrow.png", "arrow should be an image");
					assert.equal(arrow.getRawStyle("background-repeat"), "no-repeat", "arrow should be drawn once");
					assert.equal(backgroundPosition(arrow), "center", "arrow image is centered");
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
					assertActivateDepresses(button, drawingArea.top.plus(16));
				});

			});

		});

	});



	describe("CSS Integration Tests:", function() {

		describe("Home page", function() {
			var frame;
			var page;
			var viewport;

			var logo;
			var tagline;
			var drawingAreaArrow;
			var drawingArea;
			var clearButton;
			var footer;
			var joinUs;

			before(function(done) {
				this.timeout(10 * 1000);
				var options = {
					src: "/base/src/client/index.html",
					width: IOS_BROWSER_WIDTH,
					height: IPAD_LANDSCAPE_HEIGHT_WITH_BROWSER_TABS
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
				tagline = frame.get("#tagline");
				drawingAreaArrow = frame.get("#drawing-area-arrow");
				drawingArea = frame.get("#drawing-area");
				clearButton = frame.get("#clear-button");
				footer = frame.get("#footer");
				joinUs = frame.get("#join-us");
			});

			it("fits perfectly within viewport", function() {
				page.assert({
					width: viewport.width,
					height: viewport.height
				}, "page should not be larger than viewport");

				joinUs.assert({
					bottom: viewport.bottom.minus(13)
				}, "bottom element should fit against bottom of viewport");
			});

			it("has a nice margin when viewport is smaller than the page", function() {
				frame.resize(100, 100);

				joinUs.assert({
					bottom: page.bottom.minus(13)
				}, "bottom element should have a nice margin before the bottom of the page");
			});

			it("has an overall layout", function() {
				logo.assert({
					center: page.center,
					top: 12
				}, "logo should be centered at top of page");
				assert.equal(textAlign(logo), "center", "logo text should be centered");

				tagline.assert({
					center: page.center,
					top: logo.bottom.plus(5)
				}, "tagline should be centered directly below logo");
				assert.equal(textAlign(tagline), "center", "tagline text should be centered");

				drawingArea.assert({
					center: page.center,
					top: tagline.bottom.plus(10),
					width: page.width
				}, "drawing area should be centered below tagline");

				footer.assert({
					center: page.center,
					top: drawingArea.bottom.plus(13)
				}, "footer should be centered below drawing area");
				assert.equal(textAlign(footer), "center", "footer text should be centered");

				joinUs.assert({
					center: page.center,
					top: footer.bottom.plus(13),
					height: 35,
					width: 175
				}, "join us button should be centered below footer");
			});

			it("has flourishes inside drawing area", function() {
				drawingAreaArrow.assert({
					center: drawingArea.center,
					top: drawingArea.top
				}, "drawing area should have an arrow centered at the top");

				drawingAreaArrow.assert({
					height: 9
				}, "drawing area arrow should be same height as arrow gif");

				assert.equal(under(drawingAreaArrow, drawingArea), false, "drawing area arrow should be over drawing area");
				assert.equal(backgroundImage(drawingAreaArrow), "/images/arrow.png", "drawing area arrow is an image");
				assert.equal(drawingAreaArrow.getRawStyle("background-repeat"), "no-repeat", "drawing arrow is drawn once");
				assert.equal(backgroundPosition(drawingAreaArrow), "center", "drawing area arrow image is centered");

				clearButton.assert({
					top: drawingArea.top.plus(15),
					right: drawingArea.right.minus(15),
					height: 30,
					width: 70
				}, "clear screen button should be centered at top-right of drawing area");

				assert.equal(under(clearButton, drawingArea), false, "clear button should be over drawing area");
			});

			it("has a color scheme", function() {
				assert.equal(backgroundColor(frame.body()), BACKGROUND_BLUE, "page background should be light blue");
				assert.equal(textColor(logo), WHITE, "logo text should be white");
				assert.equal(textColor(tagline), DARK_BLUE, "tagline should be dark blue");
				assert.equal(backgroundColor(drawingArea), WHITE, "drawing area should be white");
				assert.equal(textColor(footer), WHITE, "footer should be white");

				assert.equal(textColor(clearButton), DARK_GRAY, "clear button background should be dark gray");
				assert.equal(backgroundColor(clearButton), GRAY, "clear button text should be medium gray");

				assert.equal(backgroundColor(joinUs), MEDIUM_BLUE, "join us button background should be medium blue");
				assert.equal(textColor(joinUs), WHITE, "join us button text should be white");
			});

			it("has a typographic scheme", function() {
				assert.equal(fontFamily(logo), STANDARD_FONT, "logo font");
				assert.equal(fontWeight(logo), HEADLINE_WEIGHT, "logo weight");
				assert.equal(fontSize(logo), "30px", "logo font size");
				logo.assert({ height: 30 }, "logo height");

				assert.equal(fontFamily(tagline), STANDARD_FONT, "tagline font");
				assert.equal(fontWeight(tagline), BODY_TEXT_WEIGHT, "tagline weight");
				assert.equal(fontSize(tagline), "15px", "tagline font size");
				tagline.assert({ height: 18 }, "tagline height");

				assert.equal(fontFamily(clearButton), STANDARD_FONT, "clear button family");
				assert.equal(fontWeight(clearButton), DRAWING_BUTTON_WEIGHT, "clear button weight");
				assert.equal(fontSize(clearButton), "12px", "clear button font size");

				assert.equal(fontFamily(footer), STANDARD_FONT, "footer family");
				assert.equal(fontWeight(footer), BODY_TEXT_WEIGHT, "footer weight");
				assert.equal(fontSize(footer), "15px", "footer font size");
				footer.assert({ height: 18 }, "footer height");

				assert.equal(fontFamily(joinUs), STANDARD_FONT, "join us button family");
				assert.equal(fontWeight(joinUs), LINK_BUTTON_WEIGHT, "join us button weight");
				assert.equal(fontSize(joinUs), "16px", "join us button font size");
			});

			it("rounds the corners of all rectangles", function() {
				assert.equal(roundedCorners(drawingArea), CORNER_ROUNDING, "drawing area");
				assert.equal(roundedCorners(clearButton), CORNER_ROUNDING, "clear button");
				assert.equal(roundedCorners(joinUs), CORNER_ROUNDING, "join us button");
			});

			describe("buttons", function() {

				it("have common styling", function() {
					assertStandardButtonStyling(clearButton, "clear button");
					assertStandardButtonStyling(joinUs, "'join us' button");
				});

				it("have specific sizes", function() {
					assertButtonSize(clearButton, 70, 30);
					assertButtonSize(joinUs, 175, 35);

					function assertButtonSize(button, width, height) {
						button.assert({
							width: width,
							height: height
						});
					}
				});

				it("have a drop shadow", function() {
					assert.equal(dropShadow(clearButton), MEDIUM_GRAY + BUTTON_DROP_SHADOW, "clear button drop shadow");
					assert.equal(dropShadow(joinUs), DARK_BLUE + BUTTON_DROP_SHADOW, "'join us' button drop shadow");
				});

				it("darken when user hovers over them", function() {
					assertHoverStyle(clearButton, DARKENED_GRAY, "clear button");
					assertHoverStyle(joinUs, DARKENED_MEDIUM_BLUE, "'join us' button");
				});

				it("appear to depress when user activates them", function() {
					assertActivateDepresses(clearButton, drawingArea.top.plus(16), "clear button");
					assertActivateDepresses(joinUs, footer.bottom.plus(14), "'join us' button");
				});

			});

		});

		describe("404 page", function() {

			var frame;
			var page;
			var viewport;

			var logo;
			var header;
			var tagline;
			var drawSomething;

			before(function(done) {
				this.timeout(10 * 1000);
				var options = {
					src: "/base/src/client/404.html",
					width: IOS_BROWSER_WIDTH,
					height: IPAD_LANDSCAPE_HEIGHT_WITH_BROWSER_TABS
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

				logo = frame.get("#logo-404");
				header = frame.get("#header-404");
				tagline = frame.get("#tagline-404");
				drawSomething = frame.get("#draw-something-404");
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
				assert.equal(fontSize(logo), "30px", "logo font size");
				assert.equal(textAlign(logo), "center", "logo text should be centered");

				header.assert({
					top: logo.bottom,
					center: viewport.center,
					height: 200
				}, "404 header should be centered under logo");
				assert.equal(fontSize(header), "200px", "header font size");
				assert.equal(textAlign(header), "center", "header text should be centered");

				tagline.assert({
					top: header.bottom.plus(tagline.height),
					center: viewport.center,
					height: 18
				}, "tagline should be centered under 404 header");
				assert.equal(fontSize(tagline), "15px", "tagline font size");
				assert.equal(textAlign(tagline), "center", "tagline text should be centered");

				drawSomething.assert({
					top: tagline.bottom.plus(tagline.height),
					center: page.center,
					height: 35,
					width: 225
				}, "button should be centered below tagline");
				assert.equal(textAlign(drawSomething), "center", "button text should be centered");
			});

			it("has a color scheme", function() {
				assert.equal(backgroundColor(frame.body()), BACKGROUND_BLUE, "page background should be light blue");
				assert.equal(textColor(logo), WHITE, "logo text should be white");
				assert.equal(textColor(header), DARK_BLUE, "header should be dark blue");
				assert.equal(textColor(tagline), DARK_BLUE, "tagline should be dark blue");

				assert.equal(backgroundColor(drawSomething), MEDIUM_BLUE, "button background should be medium blue");
				assert.equal(textColor(drawSomething), WHITE, "button text should be white");
			});

			it("has a typographic scheme", function() {
				assert.equal(fontFamily(logo), STANDARD_FONT, "logo font");
				assert.equal(fontWeight(logo), HEADLINE_WEIGHT, "logo weight");

				assert.equal(fontFamily(header), STANDARD_FONT, "header font");
				assert.equal(fontWeight(header), HEADLINE_WEIGHT, "header weight");

				assert.equal(fontFamily(tagline), STANDARD_FONT, "tagline font");
				assert.equal(fontWeight(tagline), BODY_TEXT_WEIGHT, "tagline weight");

				assert.equal(fontFamily(drawSomething), STANDARD_FONT, "draw something button family");
				assert.equal(fontWeight(drawSomething), LINK_BUTTON_WEIGHT, "draw something button weight");
			});


			describe("button", function() {

				it("has common styling", function() {
					assertStandardButtonStyling(drawSomething, "draw something button");
				});

				it("has rounded corners", function() {
					assert.equal(roundedCorners(drawSomething), CORNER_ROUNDING, "draw something button");
				});

				it("has a drop shadow", function() {
					assert.equal(dropShadow(drawSomething), DARK_BLUE + BUTTON_DROP_SHADOW, "draw something button drop shadow");
				});

				it("darkens when user hovers over them", function() {
					assertHoverStyle(drawSomething, DARKENED_MEDIUM_BLUE, "draw something button");
				});

				it("appears to depress when user activates them", function() {
					assertActivateDepresses(drawSomething, tagline.bottom.plus(19), "draw something button");
				});

			});
		});

	});


	function assertStandardButtonStyling(button, description) {
		assert.equal(textAlign(button), "center", description + "text horizontal centering");
		assert.equal(isTextVerticallyCentered(button), true, description + " text vertical centering");
		assert.equal(textIsUnderlined(button), false, description + " text underline");
		assert.equal(textIsUppercase(button), true, description + " text uppercase");
		assert.equal(hasBorder(button), false, description + " border");
	}

	function assertHoverStyle(button, expectedColor, description) {
		applyClass(button, "_hover_", function() {
			assert.equal(backgroundColor(button), expectedColor, description + " hover state background color");
		});
	}

	function assertActivateDepresses(button, expectedDescriptor, description) {
		applyClass(button, "_active_", function() {
			button.assert({
				top: expectedDescriptor
			});
			assert.equal(dropShadow(button), "none");
		});
	}

	function backgroundColor(element) {
		return normalizeColorString(element.getRawStyle("background-color"));
	}

	function fontFamily(element) {
		var family = element.getRawStyle("font-family");
		family = family.replace(/\"/g, '');

		var fonts = family.split(",");
		for (var i = 0; i < fonts.length; i++) {
			fonts[i] = trim(fonts[i]);
		}

		return fonts.join(", ");
	}

	// Based on MDN code at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
	function trim(str) {
		var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
		return str.replace(rtrim, '');
	}

	function textAlign(element) {
		return element.getRawStyle("text-align");
	}

	function fontWeight(element) {
		var weight = element.getRawStyle("font-weight");
		if (weight === "normal") weight = "400";
		return weight.toString();
	}

	function fontSize(element) {
		return element.getRawStyle("font-size");
	}

	function textColor(element) {
		return normalizeColorString(element.getRawStyle("color"));
	}

	function roundedCorners(element) {
		return getCompoundStyle(element,
			"border-top-left-radius",
			"border-top-right-radius",
			"border-bottom-left-radius",
			"border-bottom-right-radius"
		);
	}

	function margin(element) {
		return getCompoundStyle(element, "margin-top", "margin-right", "margin-bottom", "margin-left");
	}

	function padding(element) {
		return getCompoundStyle(element, "padding-top", "padding-right", "padding-bottom", "padding-left");
	}

	function getCompoundStyle(element, subStyle1, subStyle2, subStyle3, subStyle4) {
		// We can't look at compound properties directly because they return "" on Firefox and IE 9
		var one = element.getRawStyle(subStyle1);
		var two = element.getRawStyle(subStyle2);
		var three = element.getRawStyle(subStyle3);
		var four = element.getRawStyle(subStyle4);

		var result;
		if (one === two && one === three && one === four) {
			result = one;
		}
		else {
			result = one + " " + two + " " + four + " " + three;
		}
		return result;
	}


	function under(element, relativeToElement) {
		var elementZ = getZIndex(element);
		var relativeZ = getZIndex(relativeToElement);

		if (elementZ === relativeZ) {
			return !isElementAfterElementInDomTree();
		}
		else {
			return (elementZ < relativeZ);
		}

		function getZIndex(element) {
			var z = element.getRawStyle("z-index");
			if (z === "auto") z = 0;
			return z;
		}

		function isElementAfterElementInDomTree() {
			var elementNode = element.toDomElement();
			var relativeNode = relativeToElement.toDomElement();

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

	function backgroundImage(element) {
		var url = element.getRawStyle("background-image");

		var parsedUrl = url.match(/^url\("?http:\/\/(.+?)(\/.*?)"?\)$/);    // strip off domain
		if (parsedUrl === null) throw new Error("could not parse URL: " + url);

		return parsedUrl[2];
	}

	function backgroundPosition(element) {
		var position = element.getRawStyle("background-position");

		if (position === "" || position === "50%" || position === "50% 50%") {
			return "center";
		}
		else {
			return position;
		}
	}

	function hasBorder(element) {
		var top = element.getRawStyle("border-top-style");
		var right = element.getRawStyle("border-right-style");
		var bottom = element.getRawStyle("border-bottom-style");
		var left = element.getRawStyle("border-left-style");
		return !(top === "none" && right === "none" && bottom === "none" && left === "none");
	}

	function isTextVerticallyCentered(element) {
		var elementHeight = element.getRawPosition().height;
		return elementHeight + "px" === lineHeight(element);
	}

	function lineHeight(element) {
		return element.getRawStyle("line-height");
	}

	function dropShadow(element) {
		var shadow = element.getRawStyle("box-shadow");

		// When there is no drop shadow, most browsers say 'none', but IE 9 gives a color and nothing else.
		// We handle that case here.
		if (shadow === "white") return "none";
		if (shadow.match(/^#[0-9a-f]{6}$/)) return "none";      // look for '#' followed by six hex digits

		// The standard value seems to be "rgb(r, g, b) Wpx Xpx Ypx Zpx",
		// but IE 9 gives us "Wpx Xpx Ypx Zpx #rrggbb". We need to normalize it.
		// BTW, we don't support multiple shadows yet
		var groups = shadow.match(/^([^#]+) (#......)/);   // get everything before the '#' and the r, g, b
		if (groups === null) return shadow;   // There was no '#', so we assume we're not on IE 9 and everything's fine

		return normalizeColorString(groups[2]) + " " + groups[1];
	}

	function textIsUnderlined(element) {
		var style = element.getRawStyle("text-decoration");
		return style.indexOf("none") !== 0;
	}

	function textIsUppercase(element) {
		return element.getRawStyle("text-transform") === "uppercase";
	}

	function applyClass(element, className, fn) {
		var domElement = element.toDomElement();
		var oldClassName = domElement.className;
		try {
			domElement.className += " " + className;
			forceReflow(domElement);

			fn();
		}
		finally {
			domElement.className = oldClassName;
			forceReflow(domElement);
		}
	}

	function normalizeColorString(color) {
		if (color === "white") return "rgb(255, 255, 255)";
		if (color === "transparent") return "rgba(0, 0, 0, 0)";

		var colorGroups = color.match(/^#(..)(..)(..)/);    // look for presence of #rrggbb string
		if (colorGroups === null) return color;   // if doesn't match, assume we have rgb() string

		var r = parseInt(colorGroups[1], 16);
		var g = parseInt(colorGroups[2], 16);
		var b = parseInt(colorGroups[3], 16);
		return "rgb(" + r + ", " + g + ", " + b + ")";
	}

	function forceReflow(domElement) {
		var makeLintHappy = domElement.offsetHeight;
	}

}());
