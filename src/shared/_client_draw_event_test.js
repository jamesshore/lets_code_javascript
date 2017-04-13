// Copyright (c) 2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var ClientDrawEvent = require("./client_draw_event.js");
	var ServerDrawEvent = require("./server_draw_event.js");

	describe("SHARED: ClientDrawEvent", function() {

		it("converts bare objects to ClientDrawEvents and back", function() {
			var bareObject = { fromX: 1, fromY: 2, toX: 3, toY: 4 };
			var eventObject = new ClientDrawEvent(1, 2, 3, 4);

			assert.deepEqual(ClientDrawEvent.fromSerializableObject(bareObject), eventObject, "fromSerializableObject()");
			assert.deepEqual(eventObject.toSerializableObject(), bareObject, "toSerializableObject()");
		});

		it("translates to ServerDrawEvent", function() {
			var expected = new ServerDrawEvent(1, 2, 3, 4);
			var actual = new ClientDrawEvent(1, 2, 3, 4).toServerEvent();

			assert.deepEqual(actual, expected);
		});

		it("instances know their network event name", function() {
			assert.equal(new ClientDrawEvent(1, 2, 3, 4).name(), ClientDrawEvent.EVENT_NAME);
		});

	});

}());