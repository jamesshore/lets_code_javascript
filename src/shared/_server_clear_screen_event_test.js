// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ServerClearScreenEvent = require("./server_clear_screen_event.js");

	describe("SHARED: ServerClearScreenEvent", function() {

		it("converts bare objects to event objects and back", function() {
			var bareObject = {};
			var eventObject = new ServerClearScreenEvent();

			assert.deepEqual(ServerClearScreenEvent.fromPayload(bareObject), eventObject, "fromPayload()");
			assert.deepEqual(eventObject.payload(), bareObject, "payload()");
		});

		it("instances know their network event name", function() {
			assert.equal(new ServerClearScreenEvent().name(), ServerClearScreenEvent.EVENT_NAME);
		});

	});

}());