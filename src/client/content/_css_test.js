// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("../../shared/_assert.js");
	var quixote = require("./vendor/quixote-0.9.0.js");
	var cssInfo = require("./_css_info.js");

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

	describe("CSS: Unit Tests:", function() {

		var frame;

		before(function(done) {
			frame = quixote.createFrame({
				width: 500,
				stylesheet: [
					"/base/src/client/content/vendor/normalize-3.0.2.css",
					"/base/src/client/content/screen.css"
				]
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
					" <p><strong id='strong'>strong paragraph</strong></p>" +
					"</div>", "theme");

				p = frame.get("#p");
				strong = frame.get("#strong");
			});

			it("text", function() {
				assert.equal(cssInfo.fontFamily(theme), STANDARD_FONT, "font family");
			});

			it("colors", function() {
				assert.equal(cssInfo.backgroundColor(theme), BACKGROUND_BLUE, "background color");
			});

			it("normal paragraphs", function() {
				assert.equal(cssInfo.fontSize(p), "15px", "font size");
				assert.equal(cssInfo.fontWeight(p), BODY_TEXT_WEIGHT, "font weight");
				assert.equal(cssInfo.lineHeight(p), "18px", "line height");
				assert.equal(cssInfo.backgroundColor(p), TRANSPARENT, "background color");
				assert.equal(cssInfo.textColor(p), DARK_BLUE, "text color");
			});

			it("strong paragraphs", function() {
				assert.equal(cssInfo.fontSize(strong), "15px", "font size");
				assert.equal(cssInfo.fontWeight(strong), BODY_TEXT_WEIGHT, "font weight");
				assert.equal(cssInfo.textColor(strong), WHITE, "text color");
			});

		});


		describe("Layout", function() {

			describe("Full width", function() {

				var element;

				beforeEach(function() {
					element = frame.add("<div class='layout-width-full'></div>", "element");
				});

				it("is the width of the iPad", function() {
					element.assert({
						width: IOS_BROWSER_WIDTH
					});
				});

			});

			describe("Button width", function() {

				var element;

				beforeEach(function() {
					element = frame.add("<div class='layout-width-button'></div>", "element");
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
					container = frame.add(
						"<div style='width: 200px'>" +
						" <span id='layout' class='layout-center'>lay out this span</span>" +
						"</div>", "container"
					);
					element = frame.get("#layout");
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
					element = frame.add("<div class='layout-center-text'>text</div>", element);
				});

				it("has centered text", function() {
					assert.equal(cssInfo.textAlign(element), "center");
				});

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

			it("text", function() {
				assert.equal(cssInfo.textAlign(linkTag), "center", "should be horizontally centered");
				assert.equal(cssInfo.textIsUnderlined(linkTag), false, "text should not be underlined");
				assert.equal(cssInfo.textIsUppercase(linkTag), true, "text should be uppercase");
				assert.equal(cssInfo.fontFamily(buttonTag), INHERITED_FONT, "<button> should inherit container's font");
			});

			it("has no border", function() {
				assert.equal(cssInfo.hasBorder(linkTag), false, "standard link button");
				assert.equal(cssInfo.hasBorder(buttonTag), false, "button tag button");
			});

			it("has no padding or margins", function() {
				assert.equal(cssInfo.margin(buttonTag), "0px", "margin");
				assert.equal(cssInfo.padding(buttonTag), "0px", "padding");
			});

			it("has rounded corners", function() {
				assert.equal(cssInfo.roundedCorners(linkTag), CORNER_ROUNDING);
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
				assert.equal(cssInfo.isTextVerticallyCentered(linkTag), true, "should be vertically centered");
				assert.equal(cssInfo.fontSize(linkTag), "16px", "font size");
				assert.equal(cssInfo.fontWeight(linkTag), LINK_BUTTON_WEIGHT, "button weight");
			});

			it("uses bright colors", function() {
				assert.equal(cssInfo.backgroundColor(linkTag), MEDIUM_BLUE, "background");
				assert.equal(cssInfo.textColor(linkTag), WHITE, "text");
				assert.equal(cssInfo.dropShadow(linkTag), DARK_BLUE + BUTTON_DROP_SHADOW, "drop shadow");
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
				assert.equal(cssInfo.fontSize(linkTag), "12px", "font size");
				assert.equal(cssInfo.fontWeight(linkTag), DRAWING_BUTTON_WEIGHT, "font weight");
				assert.equal(cssInfo.isTextVerticallyCentered(linkTag), true, "should be vertically centered");
			});

			it("uses muted colors", function() {
				assert.equal(cssInfo.backgroundColor(linkTag), GRAY, "button background");
				assert.equal(cssInfo.textColor(linkTag), DARK_GRAY, "button text");
				assert.equal(cssInfo.dropShadow(linkTag), MEDIUM_GRAY + BUTTON_DROP_SHADOW, "drop shadow");
				assertHoverStyle(linkTag, DARKENED_GRAY, "hover background");
			});

		});


		describe("Logo block", function() {

			var logo;

			beforeEach(function() {
				logo = frame.add("<div class='logo'>logo</div>", "logo");
			});

			it("is nice and big", function() {
				logo.assert({
					height: 30
				});
			});

			it("text", function() {
				assert.equal(cssInfo.textAlign(logo), "center", "should be horizontally centered");
				assert.equal(cssInfo.isTextVerticallyCentered(logo), true, "should be vertically centered");
				assert.equal(cssInfo.fontSize(logo), "30px", "font size");
				assert.equal(cssInfo.fontWeight(logo), HEADLINE_WEIGHT, "font weight");
			});

			it("color", function() {
				assert.equal(cssInfo.backgroundColor(logo), TRANSPARENT, "background color");
				assert.equal(cssInfo.textColor(logo), WHITE, "text color");
			});

		});


		describe("'Not found' block", function() {

			var notFound;

			beforeEach(function() {
				notFound = frame.add("<div class='not-found'>404</div>", "not found");
			});

			it("is very large", function() {
				notFound.assert({
					height: 200
				});
			});

			it("text", function() {
				assert.equal(cssInfo.textAlign(notFound), "center", "should be horizontally centered");
				assert.equal(cssInfo.isTextVerticallyCentered(notFound), true, "should be vertically centered");
				assert.equal(cssInfo.fontSize(notFound), "200px", "font size");
				assert.equal(cssInfo.fontWeight(notFound), HEADLINE_WEIGHT, "font weight");
			});

			it("color", function() {
				assert.equal(cssInfo.backgroundColor(notFound), TRANSPARENT, "background color");
				assert.equal(cssInfo.textColor(notFound), DARK_BLUE, "text color");
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
					assert.equal(cssInfo.roundedCorners(canvas), CORNER_ROUNDING);
				});

				it("has a white background", function() {
					assert.equal(cssInfo.backgroundColor(canvas), WHITE);
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
					assert.equal(cssInfo.under(arrow, canvas), false);
				});

				it("has an arrow image", function() {
					arrow.assert({
						height: 9
					}, "arrow should be same height as arrow gif");

					assert.equal(cssInfo.backgroundImage(arrow), "/images/arrow.png", "arrow should be an image");
					assert.equal(arrow.getRawStyle("background-repeat"), "no-repeat", "arrow should be drawn once");
					assert.equal(cssInfo.backgroundPosition(arrow), "center", "arrow image is centered");
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



	describe("CSS: Integration Tests:", function() {

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
			var footerText;
			var joinUs;

			before(function(done) {
				this.timeout(10 * 1000);
				var options = {
					src: "/base/src/client/content/index.html",
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
				footerText = frame.get("#footer-text");
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
				assert.equal(cssInfo.textAlign(logo), "center", "logo text should be centered");
				tagline.assert({
					center: page.center,
					top: logo.bottom.plus(5)
				}, "tagline should be centered directly below logo");
				assert.equal(cssInfo.textAlign(tagline), "center", "tagline text should be centered");
				drawingArea.assert({
					center: page.center,
					top: tagline.bottom.plus(10),
					width: page.width
				}, "drawing area should be centered below tagline");

				footer.assert({
					center: page.center,
					top: drawingArea.bottom.plus(13)
				}, "footer should be centered below drawing area");
				assert.equal(cssInfo.textAlign(footer), "center", "footer text should be centered");
				joinUs.assert({
					center: page.center,
					top: footer.bottom.plus(13),
					height: 35
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

				assert.equal(cssInfo.under(drawingAreaArrow, drawingArea), false, "drawing area arrow should be over drawing area");
				assert.equal(cssInfo.backgroundImage(drawingAreaArrow), "/images/arrow.png", "drawing area arrow is an image");
				assert.equal(drawingAreaArrow.getRawStyle("background-repeat"), "no-repeat", "drawing arrow is drawn once");
				assert.equal(cssInfo.backgroundPosition(drawingAreaArrow), "center", "drawing area arrow image is centered");
				clearButton.assert({
					top: drawingArea.top.plus(15),
					right: drawingArea.right.minus(15),
					height: 30,
					width: 70
				}, "clear screen button should be centered at top-right of drawing area");

				assert.equal(cssInfo.under(clearButton, drawingArea), false, "clear button should be over drawing area");
			});

			it("has a color scheme", function() {
				assert.equal(cssInfo.backgroundColor(frame.body()), BACKGROUND_BLUE, "page background should be light blue");
				assert.equal(cssInfo.textColor(logo), WHITE, "logo text should be white");
				assert.equal(cssInfo.textColor(tagline), DARK_BLUE, "tagline should be dark blue");
				assert.equal(cssInfo.backgroundColor(drawingArea), WHITE, "drawing area should be white");
				assert.equal(cssInfo.textColor(footerText), WHITE, "footer should be white");
				assert.equal(cssInfo.textColor(clearButton), DARK_GRAY, "clear button background should be dark gray");
				assert.equal(cssInfo.backgroundColor(clearButton), GRAY, "clear button text should be medium gray");
				assert.equal(cssInfo.backgroundColor(joinUs), MEDIUM_BLUE, "join us button background should be medium blue");
				assert.equal(cssInfo.textColor(joinUs), WHITE, "join us button text should be white");
			});

			it("has a typographic scheme", function() {
				assert.equal(cssInfo.fontFamily(logo), STANDARD_FONT, "logo font");
				assert.equal(cssInfo.fontWeight(logo), HEADLINE_WEIGHT, "logo weight");
				assert.equal(cssInfo.fontSize(logo), "30px", "logo font size");
				logo.assert({ height: 30 }, "logo height");

				assert.equal(cssInfo.fontFamily(tagline), STANDARD_FONT, "tagline font");
				assert.equal(cssInfo.fontWeight(tagline), BODY_TEXT_WEIGHT, "tagline weight");
				assert.equal(cssInfo.fontSize(tagline), "15px", "tagline font size");
				tagline.assert({ height: 18 }, "tagline height");

				assert.equal(cssInfo.fontFamily(clearButton), STANDARD_FONT, "clear button family");
				assert.equal(cssInfo.fontWeight(clearButton), DRAWING_BUTTON_WEIGHT, "clear button weight");
				assert.equal(cssInfo.fontSize(clearButton), "12px", "clear button font size");
				assert.equal(cssInfo.fontFamily(footerText), STANDARD_FONT, "footer family");
				assert.equal(cssInfo.fontWeight(footerText), BODY_TEXT_WEIGHT, "footer weight");
				assert.equal(cssInfo.fontSize(footerText), "15px", "footer font size");
				footer.assert({ height: 18 }, "footer height");

				assert.equal(cssInfo.fontFamily(joinUs), STANDARD_FONT, "join us button family");
				assert.equal(cssInfo.fontWeight(joinUs), LINK_BUTTON_WEIGHT, "join us button weight");
				assert.equal(cssInfo.fontSize(joinUs), "16px", "join us button font size");
			});

			it("rounds the corners of all rectangles", function() {
				assert.equal(cssInfo.roundedCorners(drawingArea), CORNER_ROUNDING, "drawing area");
				assert.equal(cssInfo.roundedCorners(clearButton), CORNER_ROUNDING, "clear button");
				assert.equal(cssInfo.roundedCorners(joinUs), CORNER_ROUNDING, "join us button");
			});

			describe("buttons", function() {

				it("have common styling", function() {
					assertStandardButtonStyling(clearButton, "clear button");
					assertStandardButtonStyling(joinUs, "'join us' button");
				});

				it("have specific sizes", function() {
					assertButtonSize(clearButton, 70, 30);
					assertButtonSize(joinUs, 225, 35);

					function assertButtonSize(button, width, height) {
						button.assert({
							width: width,
							height: height
						});
					}
				});

				it("have a drop shadow", function() {
					assert.equal(cssInfo.dropShadow(clearButton), MEDIUM_GRAY + BUTTON_DROP_SHADOW, "clear button drop shadow");
					assert.equal(cssInfo.dropShadow(joinUs), DARK_BLUE + BUTTON_DROP_SHADOW, "'join us' button drop shadow");
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
					src: "/base/src/client/content/404.html",
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
				assert.equal(cssInfo.fontSize(logo), "30px", "logo font size");
				assert.equal(cssInfo.textAlign(logo), "center", "logo text should be centered");
				header.assert({
					top: logo.bottom,
					center: viewport.center,
					height: 200
				}, "404 header should be centered under logo");
				assert.equal(cssInfo.fontSize(header), "200px", "header font size");
				assert.equal(cssInfo.textAlign(header), "center", "header text should be centered");
				tagline.assert({
					top: header.bottom.plus(tagline.height),
					center: viewport.center,
					height: 18
				}, "tagline should be centered under 404 header");
				assert.equal(cssInfo.fontSize(tagline), "15px", "tagline font size");
				assert.equal(cssInfo.textAlign(tagline), "center", "tagline text should be centered");
				drawSomething.assert({
					top: tagline.bottom.plus(tagline.height),
					center: page.center,
					height: 35,
					width: 225
				}, "button should be centered below tagline");
				assert.equal(cssInfo.textAlign(drawSomething), "center", "button text should be centered");
			});

			it("has a color scheme", function() {
				assert.equal(cssInfo.backgroundColor(frame.body()), BACKGROUND_BLUE, "page background should be light blue");
				assert.equal(cssInfo.textColor(logo), WHITE, "logo text should be white");
				assert.equal(cssInfo.textColor(header), DARK_BLUE, "header should be dark blue");
				assert.equal(cssInfo.textColor(tagline), DARK_BLUE, "tagline should be dark blue");
				assert.equal(cssInfo.backgroundColor(drawSomething), MEDIUM_BLUE, "button background should be medium blue");
				assert.equal(cssInfo.textColor(drawSomething), WHITE, "button text should be white");
			});

			it("has a typographic scheme", function() {
				assert.equal(cssInfo.fontFamily(logo), STANDARD_FONT, "logo font");
				assert.equal(cssInfo.fontWeight(logo), HEADLINE_WEIGHT, "logo weight");
				assert.equal(cssInfo.fontFamily(header), STANDARD_FONT, "header font");
				assert.equal(cssInfo.fontWeight(header), HEADLINE_WEIGHT, "header weight");
				assert.equal(cssInfo.fontFamily(tagline), STANDARD_FONT, "tagline font");
				assert.equal(cssInfo.fontWeight(tagline), BODY_TEXT_WEIGHT, "tagline weight");
				assert.equal(cssInfo.fontFamily(drawSomething), STANDARD_FONT, "draw something button family");
				assert.equal(cssInfo.fontWeight(drawSomething), LINK_BUTTON_WEIGHT, "draw something button weight");
			});


			describe("button", function() {

				it("has common styling", function() {
					assertStandardButtonStyling(drawSomething, "draw something button");
				});

				it("has rounded corners", function() {
					assert.equal(cssInfo.roundedCorners(drawSomething), CORNER_ROUNDING, "draw something button");
				});

				it("has a drop shadow", function() {
					assert.equal(cssInfo.dropShadow(drawSomething), DARK_BLUE + BUTTON_DROP_SHADOW, "draw something button drop shadow");
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
		assert.equal(cssInfo.textAlign(button), "center", description + "text horizontal centering");
		assert.equal(cssInfo.isTextVerticallyCentered(button), true, description + " text vertical centering");
		assert.equal(cssInfo.textIsUnderlined(button), false, description + " text underline");
		assert.equal(cssInfo.textIsUppercase(button), true, description + " text uppercase");
		assert.equal(cssInfo.hasBorder(button), false, description + " border");
	}

	function assertHoverStyle(button, expectedColor, description) {
		applyClass(button, "_hover_", function() {
			assert.equal(cssInfo.backgroundColor(button), expectedColor, description + " hover state background color");
		});
	}

	function assertActivateDepresses(button, expectedDescriptor, description) {
		applyClass(button, "_active_", function() {
			button.assert({
				top: expectedDescriptor
			});
			assert.equal(cssInfo.dropShadow(button), "none");
		});
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

	function forceReflow(domElement) {
		var makeLintHappy = domElement.offsetHeight;
	}

}());
