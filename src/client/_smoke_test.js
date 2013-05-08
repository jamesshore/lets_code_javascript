// Copyright (c) 2012 Titanium I.T. LLC.	rights reserved. See LICENSE.txt for details.
/*global Raphael, mocha, Touch, $, before, after */

(function() {
	"use strict";

	describe("Smoke tests", function() {
		var iframe, app;

		before(function(done) {
			var frameName = "app";

			iframe = document.createElement("iframe");
			iframe.id = frameName;
			iframe.src = "http://app.weewikipaint.com:5001/";
			iframe.onload = function() {
				done();
			};

			document.body.appendChild(iframe);
			app = frames[frameName];

			document.domain = "weewikipaint.com";
		});

		it("should have wwp & friends defined", function() {
			expect(typeof app.wwp).not.to.equal("undefined");
		});

		after(function() {
			document.body.removeChild(iframe);
		});
	});
}());
