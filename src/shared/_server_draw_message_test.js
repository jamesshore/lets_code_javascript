// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ServerDrawMessage = require("./server_draw_message.js");

	describe("SHARED: ServerDrawMessage", function() {

		it("converts bare objects to ServerDrawMessages and back", function() {
			var bareObject = { fromX: 1, fromY: 2, toX: 3, toY: 4 };
			var messageObject = new ServerDrawMessage(1, 2, 3, 4);

			assert.deepEqual(ServerDrawMessage.fromPayload(bareObject), messageObject, "fromPayload()");
			assert.deepEqual(messageObject.payload(), bareObject, "payload()");
		});

		it("instances know their network message name", function() {
			assert.equal(new ServerDrawMessage(1, 2, 3, 4).name(), ServerDrawMessage.MESSAGE_NAME);
		});

	});

}());