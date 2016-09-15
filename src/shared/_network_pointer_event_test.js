// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("./_assert.js");
	var NetworkPointerEvent = require("./network_pointer_event.js");

	describe("UI: Network Pointer Event", function() {

		it("converts bare objects to NetworkPointerEvents", function() {
			var bareObject = { id: "a", x: 1, y: 2 };
			var expected = new NetworkPointerEvent("a", 1, 2);

			assert.deepEqual(NetworkPointerEvent.fromObject(bareObject), expected);
		});

	});

}());