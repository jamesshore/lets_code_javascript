// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ClientRemovePointerMessage = require("./client_remove_pointer_message.js");
	var ServerRemovePointerMessage = require("./server_remove_pointer_message.js");

	describe("SHARED: ClientRemovePointerMessage", function() {

		it("converts serializable objects to ClientRemovePointerMessages and back", function() {
			var bareObject = {};
			var messageObject = new ClientRemovePointerMessage();

			assert.deepEqual(ClientRemovePointerMessage.fromPayload(bareObject), messageObject, "fromPayload()");
			assert.deepEqual(messageObject.payload(), bareObject, "payload()");
		});

		it("translates to ServerRemovePointerMessage", function() {
			var expected = new ServerRemovePointerMessage("a");
			var actual = new ClientRemovePointerMessage().toServerMessage("a");

			assert.deepEqual(actual, expected);
		});

		it("instances know their network message name", function() {
			assert.equal(new ClientRemovePointerMessage().name(), ClientRemovePointerMessage.MESSAGE_NAME);
		});

	});

}());