// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ServerRemovePointerMessage = require("./server_remove_pointer_message.js");

	describe("SHARED: ServerRemovePointerMessage", function() {

		it("converts bare objects to event objects and back", function() {
			var bareObject = { id: "a" };
			var eventObject = new ServerRemovePointerMessage("a");

			assert.deepEqual(ServerRemovePointerMessage.fromPayload(bareObject), eventObject, "fromPayload()");
			assert.deepEqual(eventObject.payload(), bareObject, "payload()");
		});

		// it("instances know their network event name", function() {
		// 	assert.equal(new ServerRemovePointerMessage().name(), ServerRemovePointerMessage.MESSAGE_NAME);
		// });

	});

}());