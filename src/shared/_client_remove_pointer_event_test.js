// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ClientRemovePointerEvent = require("./client_remove_pointer_event.js");
	var ServerRemovePointerEvent = require("./server_remove_pointer_event.js");

	describe("SHARED: ClientRemovePointerEvent", function() {

		it("converts serializable objects to ClientRemovePointerEvents and back", function() {
			var bareObject = {};
			var eventObject = new ClientRemovePointerEvent();

			assert.deepEqual(ClientRemovePointerEvent.fromSerializableObject(bareObject), eventObject, "fromSerializableObject()");
			assert.deepEqual(eventObject.toSerializableObject(), bareObject, "toSerializableObject()");
		});

		it("translates to ServerRemovePointerEvent", function() {
			var expected = new ServerRemovePointerEvent("a");
			var actual = new ClientRemovePointerEvent().toServerEvent("a");

			assert.deepEqual(actual, expected);
		});

		// it("instances know their network event name", function() {
		// 	assert.equal(new ClientRemovePointerEvent().name(), ClientRemovePointerEvent.EVENT_NAME);
		// });

	});

}());