// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("_assert");
	var EventRepository = require("./event_repository.js");
	var ServerClearScreenEvent = require("../shared/server_clear_screen_event.js");

	describe("Event Repository", function() {

		var repo;

		beforeEach(function() {
			repo = new EventRepository();
		});

		it("replays no events when there aren't any", function() {
			assert.deepEqual(repo.replay(), []);
		});

		it("stores and replays multiple events", function() {
			repo.store(new ServerClearScreenEvent());
			repo.store(new ServerClearScreenEvent());
			assert.deepEqual(repo.replay(), [
				new ServerClearScreenEvent(),
				new ServerClearScreenEvent()
			]);
		});

		it("isolates its data from changes to returned results", function() {
			var events = repo.replay();
			events.push("change to our copy of repo's events");
			assert.deepEqual(repo.replay(), [], "repo's events shouldn't change");
		});

	});

}());
