// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ClientRemovePointerMessage = require("./client_remove_pointer_message.js");
	var ServerRemovePointerEvent = require("./server_remove_pointer_event.js");

	describe("SHARED: ClientRemovePointerMessage", function() {

		it("converts serializable objects to ClientRemovePointerMessages and back", function() {
			var bareObject = {};
			var eventObject = new ClientRemovePointerMessage();

			assert.deepEqual(ClientRemovePointerMessage.fromPayload(bareObject), eventObject, "fromPayload()");
			assert.deepEqual(eventObject.payload(), bareObject, "payload()");
		});

		it("translates to ServerRemovePointerEvent", function() {
			var expected = new ServerRemovePointerEvent("a");
			var actual = new ClientRemovePointerMessage().toServerEvent("a");

			assert.deepEqual(actual, expected);
		});

		// it("instances know their network event name", function() {
		// 	assert.equal(new ClientRemovePointerMessage().name(), ClientRemovePointerMessage.EVENT_NAME);
		// });

	});

}());