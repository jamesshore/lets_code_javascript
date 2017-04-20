// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var Server = require("./server.js");

	var CONTENT_DIR = "generated/test";
	var NOT_FOUND_PAGE = "test404.html";
	var PORT = 5020;

	describe("TBD", function() {

		var server;

		beforeEach(function(done) {
			server = new Server();
			server.start(CONTENT_DIR, NOT_FOUND_PAGE, PORT, done);
		});

		afterEach(function(done) {
			server.stop(done);
		});

		it("tbd", function() {
		});

	});

}());