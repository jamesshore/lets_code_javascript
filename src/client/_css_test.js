// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var HtmlElement = require("./html_element.js");
	var browser = require("./browser.js");

	describe("CSS", function() {
		if (browser.doesNotComputeStyles()) return;   // TODO: fix me?

		var htmlElement;

		beforeEach(function() {
			htmlElement = HtmlElement.fromHtml("<h1 style='text-align: center'>Hello World</h1>");
//			htmlElement = HtmlElement.fromHtml("<h1 style='margin-left: auto; margin-right: auto; width: 200px;'>Hello World</h1>");
			htmlElement.appendSelfToBody();
		});

		afterEach(function() {
			htmlElement.remove();
		});

		it("headline is centered", function(done) {
			expect(isTextCentered(htmlElement)).to.be(true);
//			expect(isElementCentered(htmlElement)).to.be(true);

//			setTimeout(done, 5000);
			done();
		});

	});

	function isTextCentered(element) {
		var domElement = element.toDomElement();

		var style = window.getComputedStyle(domElement);
		var textAlign = style.getPropertyValue("text-align");

		return textAlign === "center";
	}

}());
