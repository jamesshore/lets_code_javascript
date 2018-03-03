// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ServerClearScreenMessage = require("./server_clear_screen_message.js");

	describe("SHARED: ServerClearScreenMessage", function() {

		it("converts bare objects to event objects and back", function() {
			var bareObject = {};
			var eventObject = new ServerClearScreenMessage();

			assert.deepEqual(ServerClearScreenMessage.fromPayload(bareObject), eventObject, "fromPayload()");
			assert.deepEqual(eventObject.payload(), bareObject, "payload()");
		});

		it("instances know their network event name", function() {
			assert.equal(new ServerClearScreenMessage().name(), ServerClearScreenMessage.MESSAGE_NAME);
		});

	});

}());