// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ServerPointerEvent = require("./server_pointer_event.js");

	describe("SHARED: ServerPointerEvent", function() {

		it("converts bare objects to ServerPointerEvents and back", function() {
			var bareObject = { id: "a", x: 1, y: 2 };
			var eventObject = new ServerPointerEvent("a", 1, 2);

			assert.deepEqual(ServerPointerEvent.fromPayload(bareObject), eventObject, "fromPayload()");
			assert.deepEqual(eventObject.payload(), bareObject, "payload()");
		});

		it("instances know their network event name", function() {
			assert.equal(new ServerPointerEvent(1, 2, 3, 4).name(), ServerPointerEvent.EVENT_NAME);
		});

	});

}());