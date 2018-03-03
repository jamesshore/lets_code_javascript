// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ServerRemovePointerMessage = require("./server_remove_pointer_message.js");

	describe("SHARED: ServerRemovePointerMessage", function() {

		it("converts bare objects to message objects and back", function() {
			var bareObject = { id: "a" };
			var messageObject = new ServerRemovePointerMessage("a");

			assert.deepEqual(ServerRemovePointerMessage.fromPayload(bareObject), messageObject, "fromPayload()");
			assert.deepEqual(messageObject.payload(), bareObject, "payload()");
		});

		it("instances know their network message name", function() {
			assert.equal(new ServerRemovePointerMessage().name(), ServerRemovePointerMessage.MESSAGE_NAME);
		});

	});

}());