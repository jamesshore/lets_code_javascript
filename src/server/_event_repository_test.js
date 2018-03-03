// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const assert = require("_assert");
	const EventRepository = require("./event_repository.js");
	const ServerClearScreenMessage = require("../shared/server_clear_screen_message.js");

	describe("Event Repository", function() {

		let repo;

		beforeEach(function() {
			repo = new EventRepository();
		});

		it("replays no events when there aren't any", function() {
			assert.deepEqual(repo.replay(), []);
		});

		it("stores and replays multiple events", function() {
			repo.store(new ServerClearScreenMessage());
			repo.store(new ServerClearScreenMessage());
			assert.deepEqual(repo.replay(), [
				new ServerClearScreenMessage(),
				new ServerClearScreenMessage()
			]);
		});

		it("isolates its data from changes to returned results", function() {
			const events = repo.replay();
			events.push("change to our copy of repo's events");
			assert.deepEqual(repo.replay(), [], "repo's events shouldn't change");
		});

	});

}());
