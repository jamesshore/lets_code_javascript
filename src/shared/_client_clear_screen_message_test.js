// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ClientClearScreenMessage = require("./client_clear_screen_message.js");
	var ServerClearScreenEvent = require("./server_clear_screen_event.js");

	describe("SHARED: ClientClearScreenMessage", function() {

		it("converts serializable objects to ClientClearScreenMessages and back", function() {
			var bareObject = {};
			var eventObject = new ClientClearScreenMessage();

			assert.deepEqual(ClientClearScreenMessage.fromPayload(bareObject), eventObject, "fromPayload()");
			assert.deepEqual(eventObject.payload(), bareObject, "payload()");
		});

		it("translates to ServerClearScreenEvent", function() {
			var expected = new ServerClearScreenEvent();
			var actual = new ClientClearScreenMessage().toServerEvent();

			assert.deepEqual(actual, expected);
		});

		it("instances know their network event name", function() {
			assert.equal(new ClientClearScreenMessage().name(), ClientClearScreenMessage.EVENT_NAME);
		});

	});

}());