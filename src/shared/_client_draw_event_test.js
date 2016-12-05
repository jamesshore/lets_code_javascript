// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ClientDrawEvent = require("./client_draw_event.js");
	// var ServerPointerEvent = require("./server_pointer_event.js");

	describe("SHARED: ClientDrawEvent", function() {

		it("converts bare objects to ClientDrawEvents and back", function() {
			var bareObject = { fromX: 1, fromY: 2, toX: 3, toY: 4 };
			var eventObject = new ClientDrawEvent(1, 2, 3, 4);

			assert.deepEqual(ClientDrawEvent.fromSerializableObject(bareObject), eventObject, "fromSerializableObject()");
			assert.deepEqual(eventObject.toSerializableObject(), bareObject, "toSerializableObject()");
		});

		// it("translates to ServerPointerEvent", function() {
		// 	var expected = new ServerPointerEvent("a", 1, 2);
		// 	var actual = new ClientPointerEvent(1, 2).toServerEvent("a");
		//
		// 	assert.deepEqual(actual, expected);
		// });

	});

}());