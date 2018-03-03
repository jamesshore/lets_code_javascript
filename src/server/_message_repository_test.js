// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	const assert = require("_assert");
	const MessageRepository = require("./message_repository.js");
	const ServerClearScreenMessage = require("../shared/server_clear_screen_message.js");

	describe("Message Repository", function() {

		let repo;

		beforeEach(function() {
			repo = new MessageRepository();
		});

		it("replays no messages when there aren't any", function() {
			assert.deepEqual(repo.replay(), []);
		});

		it("stores and replays multiple messages", function() {
			repo.store(new ServerClearScreenMessage());
			repo.store(new ServerClearScreenMessage());
			assert.deepEqual(repo.replay(), [
				new ServerClearScreenMessage(),
				new ServerClearScreenMessage()
			]);
		});

		it("isolates its data from changes to returned results", function() {
			const messages = repo.replay();
			messages.push("change to our copy of repo's messages");
			assert.deepEqual(repo.replay(), [], "repo's messages shouldn't change");
		});

	});

}());
