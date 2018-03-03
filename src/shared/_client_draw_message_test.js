// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ClientDrawMessage = require("./client_draw_message.js");
	var ServerDrawMessage = require("./server_draw_message.js");

	describe("SHARED: ClientDrawMessage", function() {

		it("converts bare objects to ClientDrawMessages and back", function() {
			var bareObject = { fromX: 1, fromY: 2, toX: 3, toY: 4 };
			var eventObject = new ClientDrawMessage(1, 2, 3, 4);

			assert.deepEqual(ClientDrawMessage.fromPayload(bareObject), eventObject, "fromPayload()");
			assert.deepEqual(eventObject.payload(), bareObject, "payload()");
		});

		it("translates to ServerDrawMessage", function() {
			var expected = new ServerDrawMessage(1, 2, 3, 4);
			var actual = new ClientDrawMessage(1, 2, 3, 4).toServerEvent();

			assert.deepEqual(actual, expected);
		});

		it("instances know their network event name", function() {
			assert.equal(new ClientDrawMessage(1, 2, 3, 4).name(), ClientDrawMessage.EVENT_NAME);
		});

	});

}());