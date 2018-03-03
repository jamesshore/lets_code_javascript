// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ClientPointerMessage = require("./client_pointer_message.js");
	var ServerPointerEvent = require("./server_pointer_message.js");

	describe("SHARED: ClientPointerMessage", function() {

		it("converts bare objects to ClientPointerMessages and back", function() {
			var bareObject = { x: 1, y: 2 };
			var eventObject = new ClientPointerMessage(1, 2);

			assert.deepEqual(ClientPointerMessage.fromPayload(bareObject), eventObject, "fromPayload()");
			assert.deepEqual(eventObject.payload(), bareObject, "payload()");
		});

		it("translates to ServerPointerEvent", function() {
			var expected = new ServerPointerEvent("a", 1, 2);
			var actual = new ClientPointerMessage(1, 2).toServerMessage("a");

			assert.deepEqual(actual, expected);
		});

		it("instances know their network event name", function() {
			assert.equal(new ClientPointerMessage(1, 2).name(), ClientPointerMessage.MESSAGE_NAME);
		});

	});

}());