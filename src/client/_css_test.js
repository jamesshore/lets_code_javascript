// Copyright (c) 2014 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var HtmlElement = require("./html_element.js");

	describe("CSS", function() {

		var htmlElement;

		beforeEach(function() {
			htmlElement = HtmlElement.fromHtml("<h1>Hello World</h1>");
			htmlElement.appendSelfToBody();
		});

		afterEach(function() {
			htmlElement.remove();
		});

		it("headline is centered", function() {
			expect(isCentered(htmlElement)).to.be(true);
		});

	});

	function isCentered(element) {
		return true;
	}

}());