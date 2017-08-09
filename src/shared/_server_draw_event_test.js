// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ServerDrawEvent = require("./server_draw_event.js");

	describe("SHARED: ServerDrawEvent", function() {

		it("converts bare objects to ServerDrawEvents and back", function() {
			var bareObject = { fromX: 1, fromY: 2, toX: 3, toY: 4 };
			var eventObject = new ServerDrawEvent(1, 2, 3, 4);

			assert.deepEqual(ServerDrawEvent.fromSerializableObject(bareObject), eventObject, "fromSerializableObject()");
			assert.deepEqual(eventObject.payload(), bareObject, "payload()");
		});

		it("instances know their network event name", function() {
			assert.equal(new ServerDrawEvent(1, 2, 3, 4).name(), ServerDrawEvent.EVENT_NAME);
		});

	});

}());