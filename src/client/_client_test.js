// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global describe, it, expect, dump, wwp*/

(function() {
	"use strict";

	describe("Drawing area", function() {

		it("should be initialized in predefined div", function() {
			// create div that's assumed to be in our home page
			var div = document.createElement("div");
			div.setAttribute("id", "foo");
			document.body.appendChild(div);

			// initialize it (production code)
			wwp.initializeDrawingArea();

			// verify it was initialized correctly
			var extractedDiv = document.getElementById("foo");
			expect(extractedDiv).to.be.ok();
		});

	});
}());
