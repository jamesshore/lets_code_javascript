// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ServerClearScreenMessage = require("./server_clear_screen_message.js");

	describe("SHARED: ServerClearScreenMessage", function() {

		it("converts bare objects to message objects and back", function() {
			var bareObject = {};
			var messageObject = new ServerClearScreenMessage();

			assert.deepEqual(ServerClearScreenMessage.fromPayload(bareObject), messageObject, "fromPayload()");
			assert.deepEqual(messageObject.payload(), bareObject, "payload()");
		});

		it("instances know their network message name", function() {
			assert.equal(new ServerClearScreenMessage().name(), ServerClearScreenMessage.MESSAGE_NAME);
		});

	});

}());