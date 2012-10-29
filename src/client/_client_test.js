// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global describe, it, expect, dump, $, wwp*/

(function() {
	"use strict";

	describe("Drawing area", function() {

		it("should be initialized in predefined div", function() {
			// create div that's assumed to be in our home page
			var div = document.createElement("div");
			div.setAttribute("id", "wwp-drawingArea");
			document.body.appendChild(div);

			// initialize it (production code)
			wwp.initializeDrawingArea("wwp-drawingArea");

			// verify it was initialized correctly
			var tagName = $(div).children()[0].tagName;
			if (tagName === "svg") {
				// We're in a browser that supports SVG
				expect(tagName).to.equal("svg");
			}
			else {
				// We're in IE 8
				// IE 8: <div id="canvas"><div><span /><rvml:shape /><rvml:shape />
				expect(tagName).to.equal("DIV");
			}
		});

	});
}());
