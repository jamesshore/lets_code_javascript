// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ClientClearScreenEvent = require("./client_clear_screen_event.js");
	var ServerClearScreenEvent = require("./server_clear_screen_event.js");

	describe("SHARED: ClientClearScreenEvent", function() {

		it("converts serializable objects to ClientClearScreenEvents and back", function() {
			var bareObject = {};
			var eventObject = new ClientClearScreenEvent();

			assert.deepEqual(ClientClearScreenEvent.fromPayload(bareObject), eventObject, "fromPayload()");
			assert.deepEqual(eventObject.payload(), bareObject, "payload()");
		});

		it("translates to ServerClearScreenEvent", function() {
			var expected = new ServerClearScreenEvent();
			var actual = new ClientClearScreenEvent().toServerEvent();

			assert.deepEqual(actual, expected);
		});

		it("instances know their network event name", function() {
			assert.equal(new ClientClearScreenEvent().name(), ClientClearScreenEvent.EVENT_NAME);
		});

	});

}());