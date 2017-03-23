// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ServerRemovePointerEvent = require("./server_remove_pointer_event.js");

	describe("SHARED: ServerRemovePointerEvent", function() {

		it("converts bare objects to event objects and back", function() {
			var bareObject = { id: "a" };
			var eventObject = new ServerRemovePointerEvent("a");

			assert.deepEqual(ServerRemovePointerEvent.fromSerializableObject(bareObject), eventObject, "fromSerializableObject()");
			assert.deepEqual(eventObject.toSerializableObject(), bareObject, "toSerializableObject()");
		});

		// it("instances know their network event name", function() {
		// 	assert.equal(new ServerRemovePointerEvent().name(), ServerRemovePointerEvent.EVENT_NAME);
		// });

	});

}());