// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ClientClearScreenEvent = require("./client_clear_screen_event.js");
	// var ServerDrawEvent = require("./server_draw_event.js");

	describe("SHARED: ClientClearScreenEvent", function() {

		it("converts serializable objects to ClientClearScreenEvents and back", function() {
			var bareObject = {};
			var eventObject = new ClientClearScreenEvent();

			assert.deepEqual(ClientClearScreenEvent.fromSerializableObject(bareObject), eventObject, "fromSerializableObject()");
			assert.deepEqual(eventObject.toSerializableObject(), bareObject, "toSerializableObject()");
		});

		// it("translates to ServerClearScreenEvent", function() {
		// 	var expected = new ServerDrawEvent(1, 2, 3, 4);
		// 	var actual = new ClientDrawEvent(1, 2, 3, 4).toServerEvent();
		//
		// 	assert.deepEqual(actual, expected);
		// });

		// it("instances know their network event name", function() {
			// assert.equal(new ClientScreenEvent(1, 2, 3, 4).name(), ClientDrawEvent.EVENT_NAME);
		// });

	});

}());