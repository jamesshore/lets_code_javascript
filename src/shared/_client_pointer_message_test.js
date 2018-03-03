// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ClientPointerMessage = require("./client_pointer_message.js");
	var ServerPointerMessage = require("./server_pointer_message.js");

	describe("SHARED: ClientPointerMessage", function() {

		it("converts bare objects to ClientPointerMessages and back", function() {
			var bareObject = { x: 1, y: 2 };
			var messageObject = new ClientPointerMessage(1, 2);

			assert.deepEqual(ClientPointerMessage.fromPayload(bareObject), messageObject, "fromPayload()");
			assert.deepEqual(messageObject.payload(), bareObject, "payload()");
		});

		it("translates to ServerPointerMessage", function() {
			var expected = new ServerPointerMessage("a", 1, 2);
			var actual = new ClientPointerMessage(1, 2).toServerMessage("a");

			assert.deepEqual(actual, expected);
		});

		it("instances know their network message name", function() {
			assert.equal(new ClientPointerMessage(1, 2).name(), ClientPointerMessage.MESSAGE_NAME);
		});

	});

}());