// Copyright (c) 2016-2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ServerPointerMessage = require("./server_pointer_message.js");

	describe("SHARED: ServerPointerMessage", function() {

		it("converts bare objects to ServerPointerMessages and back", function() {
			var bareObject = { id: "a", x: 1, y: 2 };
			var eventObject = new ServerPointerMessage("a", 1, 2);

			assert.deepEqual(ServerPointerMessage.fromPayload(bareObject), eventObject, "fromPayload()");
			assert.deepEqual(eventObject.payload(), bareObject, "payload()");
		});

		it("instances know their network event name", function() {
			assert.equal(new ServerPointerMessage(1, 2, 3, 4).name(), ServerPointerMessage.MESSAGE_NAME);
		});

	});

}());