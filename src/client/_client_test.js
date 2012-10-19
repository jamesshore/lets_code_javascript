// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global describe, it, expect, dump*/

(function () {
	"use strict";

	describe("Nothing", function () {

		it("should run", function () {
			var extractedDiv = document.getElementById("tdjs");
			expect(extractedDiv.getAttribute("foo")).to.equal("bar");
		});

	});
}());
